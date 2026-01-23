// [수정 이유] 401 에러 발생 시 자동 토큰 재발급 및 재시도 로직 추가

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8111/",
  headers: {
    "Content-Type": "application/json",
  },
});

//  Request 인터셉터: 모든 요청에 AccessToken 자동 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//  Response 인터셉터: 401 에러 시 자동 재발급
let isRefreshing = false; // 중복 재발급 방지 플래그
let failedQueue = []; // 대기 중인 요청 큐

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => response, // 성공 시 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 재발급 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!refreshToken || !accessToken) {
        // 토큰이 없으면 로그인 페이지로
        localStorage.clear();
        if (window.location.href !== "http://localhost:3000/")
          window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        //  토큰 재발급 요청
        const response = await axios.post(
          "http://localhost:8111/auth/refresh",
          {
            accessToken,
            refreshToken,
          },
        );

        const newTokenData = response.data.data;

        if (newTokenData && newTokenData.accessToken) {
          // 새 토큰 저장
          localStorage.setItem("accessToken", newTokenData.accessToken);
          localStorage.setItem("refreshToken", newTokenData.refreshToken);

          // 대기 중인 요청들 처리
          processQueue(null, newTokenData.accessToken);

          // 실패했던 원래 요청 재시도
          originalRequest.headers["Authorization"] =
            `Bearer ${newTokenData.accessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // 재발급 실패 시 로그아웃 처리
        console.error("토큰 재발급 실패:", refreshError);
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;

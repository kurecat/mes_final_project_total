// src/api/axios.js
import axios from "axios";

// ★ [수정 1] 공통으로 사용할 IP와 포트를 상수로 정의 (유지보수가 쉬워짐)
const BASE_URL = "http://192.168.0.77:8111";

const axiosInstance = axios.create({
  baseURL: BASE_URL, // 위에서 정의한 IP 주소 적용
  headers: {
    "Content-Type": "application/json",
  },
});

// Request 인터셉터: 모든 요청에 AccessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response 인터셉터: 401 에러 시 자동 재발급
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

axiosInstance.interceptors.response.use(
  (response) => response, // 성공 시 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 로그인 요청(/auth/login)에서 발생한 401은 재발급 로직을 타지 않고 즉시 실패 처리
    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 재발급 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
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
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        // 토큰 재발급 요청
        // ★ [수정 2] 절대 경로(http://localhost...) 대신 상대 경로 사용
        // 이렇게 하면 위에 설정한 baseURL(192.168.0.77)을 자동으로 따라갑니다.
        const response = await axiosInstance.post("/auth/refresh", {
          accessToken,
          refreshToken,
        });

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
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 재발급 실패 시 로그아웃 처리
        console.error("토큰 재발급 실패:", refreshError);
        processQueue(refreshError, null);
        localStorage.clear();

        // 로그인 페이지가 아닐 때만 리다이렉트 (무한 새로고침 방지)
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

// src/api/axios.js
import axios from "axios";

// 1. [중요] 최상단에서 인스턴스 생성
const BASE_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 변수 선언
let isRefreshing = false;
let failedQueue = [];

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

// 3. Request 인터셉터 (인스턴스 생성 후에 와야 함)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    // ★ 디버깅용 로그 추가 (확인 후 삭제하세요)
    console.log("베이스 URL 확인용: ", BASE_URL);
    console.log("📡 API 요청 출발:", config.url);
    console.log("🔑 헤더에 실을 토큰:", token);

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 4. Response 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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

      if (!refreshToken) {
        // 토큰 없으면 로그아웃 처리
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        // ★ 재발급 요청 시에는 순환 참조 방지를 위해 axiosInstance 대신
        // 깡통 axios나 fetch를 쓰는 게 안전하지만,
        // 여기서는 경로만 잘 맞추면 문제 없습니다.
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`, // axiosInstance 대신 axios 직접 사용 (안전장치)
          {
            accessToken,
            refreshToken,
          },
        );

        const newTokenData = response.data.data;

        if (newTokenData && newTokenData.accessToken) {
          localStorage.setItem("accessToken", newTokenData.accessToken);
          localStorage.setItem("refreshToken", newTokenData.refreshToken);

          processQueue(null, newTokenData.accessToken);

          originalRequest.headers["Authorization"] =
            `Bearer ${newTokenData.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();

        window.location.href = "/";

        console.error("재발급 실패 원인 확인:", refreshError); // 에러 로그 추가
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

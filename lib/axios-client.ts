import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;
interface CustomError extends AxiosError {
    errorCode?: string;
}
const options = {
    baseURL,
    withCredentials: true,
    timeout: 10000,
};
const API = axios.create(options);

API.interceptors.request.use(async (config) => {
    if (typeof window !== "undefined") {
        const { useAuthStore } = await import("@/store/store");
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
    return config;
});

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const data = error.response?.data;
        const status = error.response?.status;

       if (typeof window !== "undefined" && data === "Unauthorized" && status === 401) {
       const { useAuthStore } = await import("@/store/store");
        useAuthStore.getState().clearAuth();
    window.location.href = "/login";
}
        const customError: CustomError = {
            ...error,
            errorCode: data?.errorCode || "UNKNOWN_ERROR",
        };
        return Promise.reject(customError);
    }
);

export default API;

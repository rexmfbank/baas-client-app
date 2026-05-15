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

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const data = error.response?.data;
        const status = error.response?.status;

        if (data === "Unauthorized" && status === 401) {
            window.location.href = "/";
        }
        const customError: CustomError = {
            ...error,
            errorCode: data?.errorCode || "UNKNOWN_ERROR",
        };
        return Promise.reject(customError);
    }
);

export default API;
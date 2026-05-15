import API from "./axios-client";
import { loginType, LoginResponseType, registerType, CountryResponseType, RegisterResponseType, VerifyPayloadType, VerifyOtpResponseType } from "@/types/auth.type";

export const loginMutationFn = async (
    data: loginType
): Promise<LoginResponseType> => {
    const response = await API.post("/client/onboarding/login", data);
    return response.data;
};

export const registerMutationFn = async (data: registerType): Promise<RegisterResponseType> => {
    const response = await API.post("/client/onboarding/register", data);
    return response.data;
}

export const getCountriesMutationFn = async (): Promise<CountryResponseType> => {
    const response = await API.get("/client/onboarding/countries");
    return response.data;
}

export const verifyOtpMutationFn = async (data: VerifyPayloadType): Promise<VerifyOtpResponseType> =>{
    const response =  await API.post("/client/onboarding/verify-otp", data);
    return response.data;
}

export const resendOtpMutationFn = async (data: any) =>
    await API.post("/client/onboarding/resend-otp", data);

// export const logoutMutationFn = async () => await API.post("/auth/logout");

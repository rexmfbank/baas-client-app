import API from "./axios-client";
import { registerType, CountryResponseType, RegisterResponseType, VerifyPayloadType, VerifyOtpResponseType, ResendOtpPayloadType } from "@/types/auth.type";
import type { ApiKeysResponseType } from "@/types/api-key.type";
import type { StatementQueryType, StatementResponseType } from "@/types/statement.type";
import type { CreateWebhookPayloadType, CreateWebhookResponseType } from "@/types/webhook.type";

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

export const resendOtpMutationFn = async (data: ResendOtpPayloadType) =>
    await API.post("/client/onboarding/resend-otp", data);

export const getStatementMutationFn = async (
    params?: StatementQueryType
): Promise<StatementResponseType> => {
    const response = await API.get("/client/onboarding/statement", { params });
    return response.data;
};

export const getApiKeysMutationFn = async (): Promise<ApiKeysResponseType> => {
    const response = await API.get("/client/onboarding/apikeys");
    return response.data;
};

export const createWebhookMutationFn = async (
    data: CreateWebhookPayloadType
): Promise<CreateWebhookResponseType> => {
    const response = await API.post("/services/partner/webhook", data);
    return response.data;
};

// export const logoutMutationFn = async () => await API.post("/auth/logout");

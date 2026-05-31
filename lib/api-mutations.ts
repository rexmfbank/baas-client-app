import API from "./axios-client";
import {
    CountryResponseType,
    LoginResponseType,
    registerType,
    RegisterResponseType,
    ResendOtpPayloadType,
    VerifyOtpResponseType,
    VerifyPayloadType,
    loginType,
} from "@/types/auth.type";
import type { ApiKeysResponseType } from "@/types/api-key.type";
import type { StatementQueryType, StatementResponseType } from "@/types/statement.type";
import type { CreateWebhookPayloadType, CreateWebhookResponseType } from "@/types/webhook.type";
import type { VirtualAccountResponseType } from "@/types/platform";


export const loginMutationFn = async (data: loginType): Promise<LoginResponseType> => {
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

export const resendOtpMutationFn = async (data: ResendOtpPayloadType) =>
    await API.post("/client/onboarding/resend-otp", data);

export const getStatementMutationFn = async (
    params?: StatementQueryType
): Promise<StatementResponseType> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append("page", String(params.page));
    if (params?.pageSize !== undefined) searchParams.append("pageSize", String(params.pageSize));
    if (params?.accountNo) searchParams.append("accountNo", params.accountNo);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.entityCode) searchParams.append("entityCode", params.entityCode);
    if (params?.tranCode) searchParams.append("tranCode", params.tranCode);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.orderType) searchParams.append("orderType", params.orderType);
    if (params?.tranDesc) searchParams.append("tranDesc", params.tranDesc);
    if (params?.transactionType) searchParams.append("transactionType", params.transactionType);
    if (params?.terminalId) searchParams.append("terminalId", params.terminalId);
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const response = await API.get(
        `/client/onboarding/statement${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
};

export const getApiKeysQueryFn = async (): Promise<ApiKeysResponseType> => {
    const response = await API.get("/client/onboarding/apikeys");
    return response.data;
};

export const getVirtualAccountsQueryFn = async (): Promise<VirtualAccountResponseType> => {
    const response = await API.get("/client/onboarding/virtual");
    return response.data;
};

export const createApiKeysMutationFn = async (): Promise<ApiKeysResponseType> => {
    const response = await API.post("/client/onboarding/apikeys",{});
    return response.data;
};

export const createWebhookMutationFn = async (
    data: CreateWebhookPayloadType
): Promise<CreateWebhookResponseType> => {
    const response = await API.post("/services/partner/webhook", data);
    return response.data;
};

// export const logoutMutationFn = async () => await API.post("/auth/logout");

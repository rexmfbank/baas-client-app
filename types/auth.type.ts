export type UserType = Record<string, never>;

export type loginType = {
    email: string;
    password: string;
};

export type LoginResponseType = {
    success: boolean;
    message: string;
    data: {
        email: string;
        countryCode: string;
        message: string;
        token?: string;
    } | null;
    timestamp: string | null;
};

export type registerType = {
     email: string;
     password: string;
     countryCode: string;
};

export type RegisterResponseType = {
    success: boolean;
    message: string;
    data: null;
    timestamp: null;
};

export type CountryType = {
    code: string;
    name: string;
    description: string;
    otherInfo: null;
    provider: null;
    url: string;
    bankUptime: number;
}
export type CountryResponseType = {
    responseCode: string;
    responseMessage: string;
    data: CountryType[]
}


export type VerifyPayloadType = {
    otp: string;
    email: string;
}
export type ResendOtpPayloadType = {
    email: string;
}
export type VerifyOtpResponseType = {
    success: boolean;
    message: string;
    data: null;
    timestamp: null;
}

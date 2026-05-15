export type UserType = {}

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
        token: string;
    };
    timestamp: string;
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
export type VerifyOtpResponseType = {
    success: boolean;
    message: string;
    data: null;
    timestamp: null;
}
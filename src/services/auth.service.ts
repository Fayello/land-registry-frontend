import { request } from "@/lib/api-client";

export const AuthService = {
    login: async (credentials: any) => {
        return request<any>("/api/auth/login", {
            method: "POST",
            body: credentials,
        });
    },
    register: async (data: any) => {
        return request<any>("/api/auth/register", {
            method: "POST",
            body: data,
        });
    },
    forgotPassword: async (email: string) => {
        return request<any>("/api/auth/forgot-password", {
            method: "POST",
            body: { email },
        });
    },
    resetPassword: async (data: any) => {
        return request<any>("/api/auth/reset-password", {
            method: "POST",
            body: data,
        });
    },
};

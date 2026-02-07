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
};

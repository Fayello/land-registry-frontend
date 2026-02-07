import { request } from "@/lib/api-client";

export const RegistryService = {
    search: async (query: string) => {
        return request<any>(`/api/registry/search`, {
            params: { query },
        });
    },
    getOwnerProperties: async () => {
        return request<any[]>("/api/owner/properties");
    },
    getPropertyById: async (id: string) => {
        return request<any>(`/api/owner/properties/${id}`);
    },
    getDeedById: async (id: string) => {
        return request<any>(`/api/owner/deeds/${id}`);
    },
};

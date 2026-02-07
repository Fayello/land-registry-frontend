import { request } from "@/lib/api-client";

export const CaseService = {
    getPublicNotices: async () => {
        return request<any[]>("/api/cases/notices");
    },
    getOwnerApplications: async () => {
        return request<any[]>("/api/owner/applications");
    },
    getApplicationById: async (id: string) => {
        return request<any>(`/api/owner/applications/${id}`);
    },
    payFees: async (id: string) => {
        return request<any>(`/api/cases/${id}/pay-fees`, {
            method: "POST"
        });
    },
    getClerkQueue: async () => {
        return request<any[]>("/api/clerk/cases");
    },
    getAuthorityQueue: async (history: boolean = false) => {
        return request<any[]>("/api/cases/pending", {
            params: { history }
        });
    },
    updateCaseStatus: async (id: string | number, status: string, notes?: string) => {
        return request<any>(`/api/cases/${id}/status`, {
            method: "POST",
            body: { status, notes }
        });
    },
    performAction: async (id: string | number, action: string, data: any = {}, method: "POST" | "PUT" = "PUT") => {
        return request<any>(`/api/cases/${id}/${action}`, {
            method,
            body: data
        });
    },
    getAdminUsers: async () => {
        return request<any[]>("/api/admin/users");
    },
    getAdminRoles: async () => {
        return request<any[]>("/api/admin/roles");
    },
    assignRole: async (payload: { userId: number; roleId: number }) => {
        return request<any>("/api/admin/assign-role", {
            method: "POST",
            body: payload,
        });
    },
    submitCase: async (payload: { type: string; related_parcel_id?: number; data: any }) => {
        return request<any>("/api/cases/submit", {
            method: "POST",
            body: payload,
        });
    },
};

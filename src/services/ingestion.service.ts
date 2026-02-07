import { request } from "@/lib/api-client";

export const IngestionService = {
    initializeScanner: async () => {
        return request<any>("/api/ingestion/scanner/initialize", {
            method: "POST",
        });
    },
    scan: async () => {
        return request<any>("/api/ingestion/scanner/scan", {
            method: "POST",
        });
    },
    extract: async (data: { scanUrl: string; fileName?: string }) => {
        return request<any>("/api/ingestion/extract", {
            method: "POST",
            body: data,
        });
    },
    confirm: async (data: { extractedData: any; scanUrl: string; ownerEmail: string }) => {
        return request<any>("/api/ingestion/confirm", {
            method: "POST",
            body: data,
        });
    },
    getHistory: async () => {
        return request<any[]>("/api/ingestion/history");
    },
};

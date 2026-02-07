import { API_URL } from "@/config/api";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
    method?: RequestMethod;
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, params } = options;

    let url = `${API_URL}${endpoint}`;
    if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        const query = queryParams.toString();
        if (query) url += `?${query}`;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error: any = new Error(data.message || `Request failed with status ${response.status}`);
            error.code = data.code;
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data as T;
    } catch (error: any) {
        console.error(`API Request Error [${method} ${endpoint}]:`, error.message);
        throw error;
    }
}

// src/api/places.ts
export type PlaceItem = {
    place_id?: number;
    title: string;
    content?: string;
    category?: string;
    location?: string; // 예: "제주"
    address?: string;
    message?: string;
    accountId?: number;
};

const BASE: string =
    (import.meta as any).env?.VITE_API_BASE_URL /* 예: "http://localhost:8080" */ ?? "http://localhost:7777";

// 공통 fetch (CORS 사용)
async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        mode: "cors",
        // credentials: "include", // 쿠키/세션 필요 시 서버 allowCredentials=true + 정확한 Origin 지정 후 주석 해제
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/** 목록 조회: GET /place/list */
export function listPlaces() {
    return http<PlaceItem[]>("/place/list");
}

/** 조건 검색: POST /place/search (title/category/location 일부만 보내도 OK) */
export function searchPlaces(body: { title?: string | null; category?: string | null; location?: string | null }) {
    const payload = {
        title: body.title?.trim() || null,
        category: body.category?.trim() || null,
        location: body.location?.trim() || null,
    };
    return http<PlaceItem[]>("/place/search", { method: "POST", body: JSON.stringify(payload) });
}

/** 단건 상세: GET /place/{place_id} */
export function getPlace(placeId: number) {
    return http<PlaceItem>(`/place/${placeId}`);
}

// 인증이 필요한 API(등록/수정/삭제)는 필요할 때 사용
export function registerPlace(token: string, payload: Omit<PlaceItem, "place_id" | "accountId">) {
    return http("/place/register", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}
export function updatePlace(token: string, payload: Required<Pick<PlaceItem, "place_id">> & Omit<PlaceItem, "accountId">) {
    return http("/place/update", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}
export function deletePlace(token: string, placeId: number) {
    return http(`/place/delete/${placeId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

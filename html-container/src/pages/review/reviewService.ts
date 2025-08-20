export type Review = {
    id: number;
    userName: string;
    title: string;
    body: string;
    createdAt: string;
    avatarUrl?: string;
};

export type ReviewQuery = {
    page?: number;
    pageSize?: number;
    keyword?: string;
};

type ReviewResponse = {
    id?: number;
    reviewId?: number;
    title?: string;
    content?: string;
    createdAt?: string;
    writerName?: string;
    authorName?: string;
    avatarUrl?: string;
};

type RegisterReviewRequest = {
    placeId: number;
    title: string;
    content: string;
};

type UpdateReviewRequest = {
    title?: string;
    content?: string;
};

const API_BASE: string =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_REVIEW_API_BASE) ||
    "/review";

function mapReview(r: ReviewResponse): Review {
    return {
        id: r.id ?? r.reviewId ?? 0,
        title: r.title ?? "",
        body: r.content ?? "",
        createdAt: r.createdAt ?? new Date().toISOString(),
        userName: r.writerName ?? r.authorName ?? "익명",
        avatarUrl: r.avatarUrl,
    };
}

export async function listReviewsByPlace(
    placeId: number,
    query: ReviewQuery = {}
): Promise<{ data: Review[]; total: number }> {
    const res = await fetch(`${API_BASE}/place/${placeId}`, {
        method: "GET",
        headers: { Accept: "application/json" },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`listReviewsByPlace failed: ${res.status} ${text}`);
    }
    const raw = (await res.json()) as ReviewResponse[];
    let all = raw.map(mapReview);

    const kw = (query.keyword ?? "").trim().toLowerCase();
    if (kw) {
        all = all.filter(
            (r) =>
                r.title.toLowerCase().includes(kw) ||
                r.body.toLowerCase().includes(kw) ||
                r.userName.toLowerCase().includes(kw)
        );
    }

    const total = all.length;
    const page = Math.max(1, query.page ?? 1);
    const size = Math.max(1, query.pageSize ?? 10);
    const start = (page - 1) * size;
    const data = all.slice(start, start + size);

    return { data, total };
}

export async function getReview(id: number): Promise<Review> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`getReview failed: ${res.status}`);
    const raw = (await res.json()) as ReviewResponse;
    return mapReview(raw);
}

export async function createReview(payload: RegisterReviewRequest): Promise<Review> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("로그인이 필요합니다.");

    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`createReview failed: ${res.status} ${t}`);
    }
    const raw = (await res.json()) as ReviewResponse | any;
    return mapReview(raw);
}

export async function updateReview(id: number, payload: UpdateReviewRequest): Promise<Review> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("로그인이 필요합니다.");

    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`updateReview failed: ${res.status} ${t}`);
    }
    const raw = (await res.json()) as ReviewResponse;
    return mapReview(raw);
}

export async function deleteReview(id: number): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("로그인이 필요합니다.");
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`deleteReview failed: ${res.status} ${t}`);
    }
}

// 표시 유틸
export const maskName = (name: string) =>
    name.length <= 1 ? name : name[0] + "＊" + name.slice(-1);

export const formatDate = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
};

// 서비스/타입 전용 파일 (이미지/카테고리 상수는 UI 파일에서 관리)

export type ThemePlace = {
    place_id: number;
    title: string;
    content: string;
    category: string; // 예: "ACTIVITY" | "CULTURE" | ...
    location: string;
    address: string;
};

export type ThemeQuery = {
    keyword?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    location?: string;
};

// 백엔드 응답 타입(필드명은 너희 서버에 맞춰 조정)
type SearchPlaceResponse = {
    id?: number; place_id?: number;
    title: string;
    category: string;
    location: string;
    address: string;
    content?: string; description?: string;
};

// 페이지네이션 유틸
function paginate<T>(arr: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
}

// FE ↔︎ BE 매핑 함수 (필드명 다르면 여기만 고치면 됨)
function mapToThemePlace(x: SearchPlaceResponse): ThemePlace {
    return {
        place_id: x.id ?? x.place_id ?? 0,
        title: x.title,
        content: x.content ?? x.description ?? "",
        category: x.category,
        location: x.location,
        address: x.address,
    };
}

// 환경변수 있으면 사용, 없으면 로컬 8080으로
// 프록시 우회, 백엔드로 직통
const API_BASE =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE)
    || "http://localhost:7777/place";


export async function listThemePlaces(
    query: ThemeQuery
): Promise<{ data: ThemePlace[]; total: number }> {
    const payload = {
        title: query.keyword?.trim() || null,
        category: query.category || null,
        location: query.location || null,
    };

    const res = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Search failed: ${res.status} ${txt}`);
    }

    const json = (await res.json()) as SearchPlaceResponse[];

    // 백엔드가 페이지네이션을 아직 안 주니까 프론트에서 잘라서 사용
    const all = json.map(mapToThemePlace);
    const total = all.length;
    const page = Math.max(1, query.page ?? 1);
    const size = Math.max(1, query.pageSize ?? 10);
    const start = (page - 1) * size;
    const data = all.slice(start, start + size);

    return { data, total };
}
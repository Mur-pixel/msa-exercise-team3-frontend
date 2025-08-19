// pages/theme/themeService.ts
// 👉 서비스/타입 전용 파일 (이미지/카테고리 상수는 UI 파일에서 관리)

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
};

// =====================
// 임시 목 데이터 (후에 API로 교체)
// =====================
const RAW: ThemePlace[] = [
    {
        place_id: 101,
        title: "강원랜드카지노",
        content:
            "국내 유일 내국인 출입 가능 카지노로 리조트, 호텔, 스키장 등이 인접해 있습니다.",
        category: "ACTIVITY",
        location: "강원특별자치도",
        address: "강원특별자치도 정선군 고한읍 고한7길 50",
    },
    {
        place_id: 125,
        title: "삽교호관광지",
        content:
            "유람선, 놀이기구, 호수 산책로 등 다양한 체험이 가능한 충남의 대표 가족형 관광지입니다.",
        category: "ACTIVITY",
        location: "충청남도",
        address: "충청남도 당진시 신평면 삽교천3로 79",
    },
    // 필요하면 더 추가…
];

// 페이지네이션 유틸
function paginate<T>(arr: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
}

// =====================
// 공개 API (목)
// =====================
export async function listThemePlaces(
    query: ThemeQuery
): Promise<{ data: ThemePlace[]; total: number }> {
    const { keyword = "", category = "", page = 1, pageSize = 10 } = query;

    // 필터링
    const kw = keyword.trim().toLowerCase();
    let data = RAW.filter((p) => {
        const byKw = kw
            ? p.title.toLowerCase().includes(kw) ||
            p.content.toLowerCase().includes(kw)
            : true;
        const byCat = category ? p.category === category : true;
        return byKw && byCat;
    });

    const total = data.length;
    data = paginate(data, page, pageSize);

    // 실제 API 딜레이 시뮬
    await new Promise((r) => setTimeout(r, 200));
    return { data, total };
}

// =====================
// 실제 백엔드로 교체 시 예시
// =====================
// export async function listThemePlaces(query: ThemeQuery) {
//   const url = new URL("/api/theme", window.location.origin);
//   if (query.keyword)  url.searchParams.set("keyword", query.keyword);
//   if (query.category) url.searchParams.set("category", query.category);
//   url.searchParams.set("page", String(query.page ?? 1));
//   url.searchParams.set("pageSize", String(query.pageSize ?? 10));
//
//   const res = await fetch(url.toString());
//   if (!res.ok) throw new Error("Failed to fetch");
//   return (await res.json()) as { data: ThemePlace[]; total: number };
// }

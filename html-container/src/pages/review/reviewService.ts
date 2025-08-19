// pages/review/reviewService.ts
export type Review = {
    id: number;
    userName: string;        // 원본 이름 (마스킹은 프론트에서)
    title: string;
    body: string;
    createdAt: string;       // ISO string
    avatarUrl?: string;
};

export type ReviewQuery = {
    page?: number;
    pageSize?: number;
    keyword?: string;
};

const RAW: Review[] = [
    {
        id: 1,
        userName: "민지",
        title: "예술의 전당",
        body:
            "오사카 여행 첫날, 간사이공항에서 난바역으로 가는 라피트를 미리 예약해서 갔어요. 여행 계획을 세울 때는 완벽했는데… 현실은 그렇게 호락호락하지 않더라고요 😅 비행기가 늦어져서 라피트를 놓치고 말았어요 ㅠㅠ",
        createdAt: "2025-08-10T10:12:00+09:00",
    },
    {
        id: 2,
        userName: "도현",
        title: "예술의 전당",
        body:
            "입국 수속하고 짐 찾고 하다 보니 시간이 훌쩍… 다음 편으로 갈아탔습니다. 그래도 공연은 최고였어요! 좌석도 편했고 음향도 좋아요 👏",
        createdAt: "2025-08-09T18:22:00+09:00",
    },
    // 필요시 더 추가…
];

function paginate<T>(arr: T[], page: number, size: number) {
    const start = (page - 1) * size;
    return arr.slice(start, start + size);
}

export async function listReviews(
    query: ReviewQuery
): Promise<{ data: Review[]; total: number }> {
    const { page = 1, pageSize = 10, keyword = "" } = query;
    const kw = keyword.trim().toLowerCase();

    let data = RAW.filter((r) =>
        kw
            ? r.title.toLowerCase().includes(kw) ||
            r.body.toLowerCase().includes(kw) ||
            r.userName.toLowerCase().includes(kw)
            : true
    );

    const total = data.length;
    data = paginate(data, page, pageSize);

    await new Promise((r) => setTimeout(r, 150)); // 모의 지연
    return { data, total };
}

// 유틸(프론트 표시용)
export const maskName = (name: string) =>
    name.length <= 1 ? name : name[0] + "＊" + name.slice(-1);

export const formatDate = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
};

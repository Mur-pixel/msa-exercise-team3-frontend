// pages/review/ReviewBoard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listReviews, Review, ReviewQuery, maskName, formatDate } from "./reviewService";
import "./Review.css";

const PAGE_SIZE = 10;

export default function ReviewBoard() {
    const [sp, setSp] = useSearchParams();
    const [page, setPage] = useState<number>(Number(sp.get("page") ?? 1));
    const [keyword, setKeyword] = useState(sp.get("keyword") ?? "");
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Review[]>([]);
    const [total, setTotal] = useState(0);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const query: ReviewQuery = useMemo(() => ({ page, pageSize: PAGE_SIZE, keyword }), [page, keyword]);

    useEffect(() => {
        const next = new URLSearchParams();
        if (keyword) next.set("keyword", keyword);
        next.set("page", String(page));
        setSp(next, { replace: true });
    }, [page, keyword, setSp]);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const { data, total } = await listReviews(query);
                if (!alive) return;
                setItems(data);
                setTotal(total);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [query]);

    const go = (p: number) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const pages = useMemo(() => {
        const MAX = 7;
        if (totalPages <= MAX) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const left = Math.max(1, page - 3);
        const right = Math.min(totalPages, left + MAX - 1);
        const start = Math.max(1, right - MAX + 1);
        return Array.from({ length: right - start + 1 }, (_, i) => start + i);
    }, [page, totalPages]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="rv-container">
            {/* 상단 검색줄(간단) */}
            <form className="rv-search" onSubmit={onSubmit}>
                <input
                    className="rv-input"
                    placeholder="리뷰 검색 (제목/내용/작성자)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button className="rv-btn" type="submit" disabled={loading}>검색</button>
            </form>

            {/* 리스트 */}
            <ul className="rv-list">
                {loading ? (
                    <li className="rv-empty">불러오는 중…</li>
                ) : items.length === 0 ? (
                    <li className="rv-empty">등록된 리뷰가 없어요.</li>
                ) : (
                    items.map((r) => (
                        <li key={r.id} className="rv-card">
                            <header className="rv-header">
                                <div className="rv-avatar" aria-hidden>
                                    {r.userName ? r.userName[0] : "?"}
                                </div>
                                <div className="rv-headmeta">
                                    <div className="rv-who">
                                        <span className="rv-name">{maskName(r.userName)}</span>
                                        <span className="rv-dot" aria-hidden>·</span>
                                        <time className="rv-date">{formatDate(r.createdAt)}</time>
                                    </div>
                                </div>
                            </header>

                            <h3 className="rv-title">{r.title}</h3>

                            {/* 본문: 오른쪽 얇은 인용 라인 */}
                            <blockquote className="rv-quote">{r.body}</blockquote>
                        </li>
                    ))
                )}
            </ul>

            {/* 페이지네이션 (Theme와 동일 스타일을 재사용해도 됩니다) */}
            <nav className="rv-pager" aria-label="페이지네이션">
                <button className="rv-page" onClick={() => go(1)} disabled={page === 1} aria-label="첫 페이지">«</button>
                <button className="rv-page" onClick={() => go(page - 1)} disabled={page === 1} aria-label="이전 페이지">‹</button>
                {pages[0] > 1 && <span className="rv-ellipsis">…</span>}
                {pages.map((p) => (
                    <button
                        key={p}
                        className={`rv-page ${p === page ? "is-active" : ""}`}
                        onClick={() => go(p)}
                        aria-current={p === page ? "page" : undefined}
                    >
                        {p}
                    </button>
                ))}
                {pages[pages.length - 1] < totalPages && <span className="rv-ellipsis">…</span>}
                <button className="rv-page" onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="다음 페이지">›</button>
                <button className="rv-page" onClick={() => go(totalPages)} disabled={page === totalPages} aria-label="마지막 페이지">»</button>
            </nav>
        </div>
    );
}

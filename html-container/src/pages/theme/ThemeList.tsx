import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listThemePlaces, ThemePlace, ThemeQuery } from "./themeService";
import "./Theme.css";

import ThemeCategoryRow, { ThemeCategoryItem } from "./ThemeCategoryRow";
import PillSelect from "././components/PillSelect";

// ⬇ 이미지 import (경로: html-container/src/assets/*.jpg)
import imgActivity  from "../../assets/activity.jpg";
import imgCulture   from "../../assets/culture.jpg";
import imgNature    from "../../assets/nature.jpg";
import imgShopping  from "../../assets/shopping.jpg";
import imgTransport from "../../assets/transport.jpg";

// 카테고리 썸네일 데이터 (UI 파일에서 관리)
const THEME_CATS: ThemeCategoryItem[] = [
    { value: "ACTIVITY",  label: "액티비티", image: imgActivity  },
    { value: "CULTURE",   label: "문화",     image: imgCulture   },
    { value: "NATURE",    label: "자연",     image: imgNature    },
    { value: "SHOPPING",  label: "쇼핑",     image: imgShopping  },
    { value: "TRANSPORT", label: "교통",     image: imgTransport },
];

const PAGE_SIZE_DEFAULT = 10;
// 선택형 셀렉트(툴바) 옵션
const CATEGORIES = [
    { value: "",          label: "전체" },
    { value: "ACTIVITY",  label: "액티비티" },
    { value: "CULTURE",   label: "문화" },
    { value: "NATURE",    label: "자연" },
    { value: "SHOPPING",  label: "쇼핑" },
    { value: "TRANSPORT", label: "교통" },
];

export default function ThemeList() {
    const [sp, setSp] = useSearchParams();

    // URL 동기화 상태
    const [keyword, setKeyword]   = useState(sp.get("keyword") ?? "");
    const [category, setCategory] = useState<string>(sp.get("category") ?? "");
    const [page, setPage]         = useState<number>(Number(sp.get("page") ?? 1));
    const [pageSize]              = useState<number>(PAGE_SIZE_DEFAULT);

    // 서버 응답 상태
    const [loading, setLoading] = useState(false);
    const [total, setTotal]     = useState(0);
    const [items, setItems]     = useState<ThemePlace[]>([]);

    // total 기반 페이지 수
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // 쿼리 객체 (API 파라미터)
    const query: ThemeQuery = useMemo(
        () => ({ keyword, category, page, pageSize }),
        [keyword, category, page, pageSize]
    );

    // URL 쿼리 반영
    useEffect(() => {
        const next = new URLSearchParams();
        if (keyword)  next.set("keyword", keyword);
        if (category) next.set("category", category);
        next.set("page", String(page));
        setSp(next, { replace: true });
    }, [keyword, category, page, setSp]);

    // 데이터 로딩
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await listThemePlaces(query);
                if (!alive) return;
                setItems(res.data);
                setTotal(res.total);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [query]);

    // 페이지 이동
    const go = (p: number) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 페이지 버튼 묶음
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="tl-container">
            {/* 카테고리 원형 썸네일 행 */}
            <ThemeCategoryRow
                categories={THEME_CATS}
                value={category}
                onChange={(next) => { setCategory(next); setPage(1); }}
            />

            {/* 알약 검색바 */}
            <form className="tl-searchbar" role="search" onSubmit={onSubmit}>
        <span className="tl-searchbar__icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>

                <label htmlFor="keyword" className="sr-only">키워드</label>
                <input
                    id="keyword"
                    className="tl-searchbar__input"
                    placeholder="예: 워터파크"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <label htmlFor="category" className="sr-only">카테고리</label>
                <PillSelect
                    id="category"
                    className="tl-searchbar__select"         // 검색바 높이/간격 유지
                    value={category}
                    options={CATEGORIES}
                    onChange={(v) => { setCategory(v); setPage(1); }}
                />

                <button className="tl-searchbar__btn" type="submit" disabled={loading}>
                    검색
                </button>
            </form>

            {/* 목록 */}
            <section className="tl-list-wrap">
                {loading ? (
                    <div className="tl-empty">불러오는 중…</div>
                ) : items.length === 0 ? (
                    <div className="tl-empty">조건에 맞는 결과가 없어요.</div>
                ) : (
                    <ul className="tl-list" aria-label="테마여행 목록">
                        {items.map((p) => (
                            <li key={p.place_id} className="tl-card">
                                <div className="tl-card__body">
                                    <h3 className="tl-card__title">
                                        <span className="tl-card__bar" aria-hidden>│</span>
                                        {p.title}
                                    </h3>
                                    <div className="tl-card__meta tl-card__meta--single">
                                        <span className="tl-meta__addr">{p.address}</span>
                                    </div>

                                    <p className="tl-card__desc">{p.content}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 페이지네이션 */}
            <nav className="tl-pager" aria-label="페이지네이션">
                <button className="tl-page" onClick={() => go(1)} disabled={page === 1} aria-label="첫 페이지">«</button>
                <button className="tl-page" onClick={() => go(page - 1)} disabled={page === 1} aria-label="이전 페이지">‹</button>

                {pages[0] > 1 && <span className="tl-ellipsis">…</span>}
                {pages.map((p) => (
                    <button
                        key={p}
                        className={`tl-page ${p === page ? "is-active" : ""}`}
                        onClick={() => go(p)}
                        aria-current={p === page ? "page" : undefined}
                    >
                        {p}
                    </button>
                ))}
                {pages[pages.length - 1] < totalPages && <span className="tl-ellipsis">…</span>}

                <button className="tl-page" onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="다음 페이지">›</button>
                <button className="tl-page" onClick={() => go(totalPages)} disabled={page === totalPages} aria-label="마지막 페이지">»</button>
            </nav>
        </div>
    );
}

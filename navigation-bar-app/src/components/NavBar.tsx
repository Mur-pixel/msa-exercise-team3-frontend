import React, { useState } from "react"; // useState 추가 (placeholder 상태 관리)
import "./NavBar.css";

export default function NavBar() {
    // placeholder 상태 변수 추가
    const [placeholder, setPlaceholder] = useState("지친 나를 위한 힐링 여행");

    const onSubmit = (e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        alert(`검색: ${q}`);
    };

    return (
        <header className="pd-header">
            <div className="pd-bar">
                <a href="/" className="pd-logo">PlaceData</a>

                <form className="pd-search" onSubmit={onSubmit} role="search" aria-label="사이트 검색">
                    <input
                        name="q"
                        className="pd-search-input"
                        // placeholder를 state에서 가져오도록 수정
                        placeholder={placeholder}
                        aria-label="검색어 입력"
                        // focus 시 placeholder 제거
                        onFocus={() => setPlaceholder("")}
                        // blur 시 값이 비어 있으면 placeholder 복구
                        onBlur={(e) => {
                            if (!e.target.value) {
                                setPlaceholder("지친 나를 위한 힐링 여행");
                            }
                        }}
                    />
                    <button className="pd-search-btn" aria-label="검색">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" strokeWidth="2" />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </form>

                <nav className="pd-auth">
                    <a href="/signup">회원가입</a>
                    <span className="pd-divider">|</span>
                    <a href="/login">로그인</a>
                    <span className="pd-divider">|</span>
                    <a href="/support">고객센터</a>
                </nav>
            </div>

            <NavTabs />
        </header>
    );
}

function NavTabs() {
    return (
        <nav className="pd-tabs" aria-label="주요 카테고리">
            <a href="/domestic" className="pd-tab">국내여행</a>
            <a href="/theme" className="pd-tab">테마여행</a>
            <a href="/custom" className="pd-tab">맞춤여행</a>
            <a href="/reviews" className="pd-tab">리뷰게시판</a>
        </nav>
    );
}

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

type NavBarProps = {
    isLoggedIn?: boolean;
    userName?: string | null;
    onLogout?: () => void;
    detectLocalTokenKey?: string;
};

export default function NavBar({
                                   isLoggedIn,
                                   userName,
                                   onLogout,
                                   detectLocalTokenKey = "accessToken",
                               }: NavBarProps) {
    const [placeholder, setPlaceholder] = useState("지친 나를 위한 힐링 여행");
    const [computedLogin, setComputedLogin] = useState<boolean>(!!isLoggedIn);

    // 현재 경로 기반으로 마이페이지 여부 판별
    const location = useLocation();
    const isMyPage = location.pathname.startsWith("/mypage");

    useEffect(() => {
        if (typeof isLoggedIn === "boolean") {
            setComputedLogin(isLoggedIn);
        } else {
            setComputedLogin(!!localStorage.getItem(detectLocalTokenKey));
        }
    }, [isLoggedIn, detectLocalTokenKey]);

    useEffect(() => {
        const onStorage = () => {
            if (typeof isLoggedIn !== "boolean") {
                setComputedLogin(!!localStorage.getItem(detectLocalTokenKey));
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [isLoggedIn, detectLocalTokenKey]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        alert(`검색: ${q}`);
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        else {
            localStorage.removeItem(detectLocalTokenKey);
            setComputedLogin(false);
        }
    };

    return (
        <header className="pd-header">
            <div className="pd-bar">
                <Link to="/" className="pd-logo">
                    <span className="logo-mark">🌊</span>
                    <h1 className="logo-text">Place Data</h1>
                </Link>

                <form className="pd-search" onSubmit={onSubmit} role="search" aria-label="사이트 검색">
                    <input
                        name="q"
                        className="pd-search-input"
                        placeholder={placeholder}
                        aria-label="검색어 입력"
                        onFocus={() => setPlaceholder("")} // placeholder 포커스 시 제거
                        onBlur={(e) => { if (!e.target.value) setPlaceholder("지친 나를 위한 힐링 여행"); }} // 포커스 해제 시 원상복구
                    />
                    <button className="pd-search-btn" aria-label="검색" type="submit">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" strokeWidth="2" />
                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </form>

                <nav className="pd-auth" aria-label="사용자 메뉴">
                    {computedLogin ? (
                        <>
                            {userName && <span className="pd-hello">{userName}님</span>}
                            <Link to="/mypage">마이페이지</Link>
                            <span className="pd-divider">|</span>
                            <button type="button" className="pd-linklike-btn" onClick={handleLogout} aria-label="로그아웃">
                                로그아웃
                            </button>
                            <span className="pd-divider">|</span>
                            <Link to="/support">고객센터</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/signup">회원가입</Link>
                            <span className="pd-divider">|</span>
                            <Link to="/login">로그인</Link>
                            <span className="pd-divider">|</span>
                            <Link to="/support">고객센터</Link>
                        </>
                    )}
                </nav>
            </div>

            {/* 마이페이지 경로면 마이페이지 탭, 아니면 기존 탭 */}
            {computedLogin && isMyPage ? <MyPageTabs /> : <NavTabs />}
        </header>
    );
}

function NavTabs() {
    return (
        <nav className="pd-tabs" aria-label="주요 카테고리">
            <Link to="/domestic" className="pd-tab">국내여행</Link>
            <Link to="/theme" className="pd-tab">테마여행</Link>
            <Link to="/custom" className="pd-tab">맞춤여행</Link>
            <Link to="/reviews" className="pd-tab">리뷰게시판</Link>
        </nav>
    );
}

/** 마이페이지 전용 서브탭 */
function MyPageTabs() {
    const { pathname } = useLocation();

    const items = [
        // { to: "/mypage", label: "내프로필", match: /^\/mypage\/?$/ }, // 기존 라인
        {
            to: "/mypage/profile",                               // 처음부터 /mypage/profile로 이동하도록
            label: "내프로필",
            match: /^\/mypage(\/profile)?\/?$/                   // /mypage와 /mypage/profile 모두 매칭
        },
        { to: "/mypage/edit", label: "회원정보 수정", match: /^\/mypage\/edit/ },
        { to: "/mypage/delete", label: "회원탈퇴", match: /^\/mypage\/delete/ },
    ];

    return (
        <nav className="pd-subtabs" aria-label="마이페이지 네비게이션">
            <div className="pd-subtabs-inner">
                {items.map(({ to, label, match }) => {
                    const active = match.test(pathname);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`pd-subtab ${active ? "is-active" : ""}`}
                            aria-current={active ? "page" : undefined}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// /navigation-bar-app/src/App.tsx
import React, { useCallback, useEffect, useState } from "react";
import NavBarRaw from "./components/NavBar";
import "./components/NavBar.css";

// NavBar가 아직 props 타입을 정의하지 않았다면 아래 캐스팅으로 TS 경고를 피합니다.
// (원하면 NavBar 컴포넌트에 동일한 props를 정식으로 선언해 주세요)
type AuthUser = { name: string; email: string } | null;
const NavBar = NavBarRaw as unknown as React.ComponentType<{
    isLoggedIn?: boolean;
    user?: AuthUser;
    onLogout?: () => void;
}>;

const readAuth = (): { token: string | null; user: AuthUser } => {
    try {
        const token = localStorage.getItem("accessToken");
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
        return { token, user };
    } catch {
        return { token: null, user: null };
    }
};

export default function App() {
    const [{ token, user }, setAuth] = useState(readAuth());
    const isLoggedIn = !!token;

    const syncAuth = useCallback(() => setAuth(readAuth()), []);

    useEffect(() => {
        const onAuthChanged = () => syncAuth();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "accessToken" || e.key === "user") syncAuth();
        };

        // 호스트앱(Login.tsx 등)에서 로그인 성공 시 dispatch하는 커스텀 이벤트
        window.addEventListener("auth:changed", onAuthChanged as EventListener);
        // 다른 탭/창에서 변경한 것도 반영
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("auth:changed", onAuthChanged as EventListener);
            window.removeEventListener("storage", onStorage);
        };
    }, [syncAuth]);

    const onLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // 전역에 로그인 상태 변경 알림
        window.dispatchEvent(new CustomEvent("auth:changed"));
        // 필요 시 로그인 페이지로 유도
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }, []);

    return (
        <>
            <NavBar isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
            {/* 아래에 라우터/페이지 렌더링 (호스트 앱에서 담당) */}
        </>
    );
}

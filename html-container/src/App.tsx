import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/mypage/Profile";
import EditProfile from "./pages/mypage/EditProfile.tsx";
import DeleteAccount from "./pages/mypage/DeleteAccount.tsx";
import Domestic from "./pages/domestic/Domestic.tsx";
import KakaoCallback from "./pages/auth/KakaoCallback.tsx";
import ReviewBoard from "./pages/review/ReviewBoard.tsx";
import ThemeList from "./pages/theme/ThemeList.tsx";
import SignUp from "./pages/auth/SignUp.tsx";

import { CircularProgress } from "@mui/material";
import {
    BrowserRouter,
    Route,
    Routes,
    useLocation,
    Navigate,
    Outlet,
} from "react-router-dom";

const NavigationBarApp = lazy(() => import("navigationBarApp/App"));

/** localStorage ↔ React state 동기화 훅 */
function useAuthSync() {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("accessToken")
    );
    const [user, setUser] = useState<any>(() => {
        const raw = localStorage.getItem("user");
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const refresh = () => {
            setToken(localStorage.getItem("accessToken"));
            try {
                const raw = localStorage.getItem("user");
                setUser(raw ? JSON.parse(raw) : null);
            } catch {
                setUser(null);
            }
        };

        const onStorage = (e: StorageEvent) => {
            if (e.key === "accessToken" || e.key === "user") refresh();
        };

        // 커스텀 이벤트(로그인 완료 시 프론트 어딘가에서 dispatch 가능)
        const onAuthChanged = () => refresh();

        window.addEventListener("storage", onStorage);
        window.addEventListener("auth:changed", onAuthChanged as EventListener);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth:changed", onAuthChanged as EventListener);
        };
    }, []);

    return { token, user, setToken, setUser };
}

// 보호 라우팅: 비로그인 시 /login
function ProtectedRoute({
                            children,
                            token,
                        }: {
    children: JSX.Element;
    token: string | null;
}) {
    return token ? children : <Navigate to="/login" replace />;
}

// 마이페이지 레이아웃
function MyPageLayout() {
    return (
        <div style={{ padding: "24px" }}>
            <Outlet />
        </div>
    );
}

const App = () => {
    return (
        <BrowserRouter>
            <AppInner />
        </BrowserRouter>
    );
};

export default App;

function AppInner() {
    const location = useLocation();
    // 로그인/카카오 콜백 페이지에서는 네비바 숨김
    const hideNav =
        location.pathname === "/login" ||
        location.pathname === "/oauth/kakao/callback";

    // 전역 인증 상태 동기화
    const { token, user, setToken, setUser } = useAuthSync();

    // 네비에서 사용할 로그아웃 핸들러 (원격앱에 props로 넘김)
    const onLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        // 전체 앱에 알리기(선택)
        window.dispatchEvent(new CustomEvent("auth:changed"));
        // 메인으로 이동
        window.location.href = "/";
    };

    return (
        <Suspense fallback={<CircularProgress />}>
            {!hideNav && (
                <NavigationBarApp token={token} user={user} onLogout={onLogout} />
            )}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route path="/domestic" element={<Domestic />} />
                <Route path="/theme" element={<ThemeList />} />
                <Route path="/reviews" element={<ReviewBoard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />

                <Route path="/support" element={<Support />} />

                <Route
                    path="/mypage"
                    element={
                        <ProtectedRoute token={token}>
                            <MyPageLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="edit" element={<EditProfile />} />
                    <Route path="delete" element={<DeleteAccount />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

/* 임시 페이지들 */
function Support() {
    return <div>고객센터(임시). 실제 컴포넌트로 대체 예정.</div>;
}

const container = document.getElementById("app") as HTMLElement;
if (!container) throw new Error("Root container #app not found");
const root = ReactDOM.createRoot(container);
root.render(<App />);

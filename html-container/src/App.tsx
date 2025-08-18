import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Home from "./pages/Home";
import Login from "./pages/Login";

import { CircularProgress } from "@mui/material";
// Navigate, NavLink, Outlet 임포트
import { BrowserRouter, Route, Routes, useLocation, Navigate, NavLink, Outlet } from "react-router-dom"; // [ADDED]

const NavigationBarApp = lazy(() => import("navigationBarApp/App"));

const App = () => {
    const [isNavigationBarLoaded, setIsNavigationBarLoaded] = useState(false);

    useEffect(() => {
        import("navigationBarApp/App")
            .then(() => setIsNavigationBarLoaded(true))
            .catch((err) => console.error("Failed to load navigation bar:", err));
    }, []);

    return (
        <BrowserRouter>
            {/* App에서는 NavBar/Routes를 렌더링하지 않고 AppInner만 둡니다. */}
            <AppInner />
        </BrowserRouter>
    );
};

export default App;

// 로그인 여부 간단 체크 유틸 (토큰 기준)
//  - 추후 전역 AuthContext/zustand로 대체 권장
function isLoggedIn() { // [ADDED]
    return !!localStorage.getItem("accessToken");
}

// 보호 라우팅: 비로그인 시 /login 으로 이동
function ProtectedRoute({ children }: { children: JSX.Element }) { // [ADDED]
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// 마이페이지 레이아웃 & 임시 페이지들 (실제 파일 생기면 교체해도 됨)
function MyPageLayout() { // [ADDED - TEMP]
    return (
        <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #eee", marginBottom: 24 }}>
                <NavLink to="profile">내프로필</NavLink>
                <NavLink to="edit">회원정보 수정</NavLink>
                <NavLink to="delete">회원탈퇴</NavLink>
            </div>
            <Outlet />
        </div>
    );
}
function Profile() { // [ADDED - TEMP]
    return <div>프로필 화면(임시). 실제 컴포넌트로 대체 예정.</div>;
}
function EditProfile() { // [ADDED - TEMP]
    return <div>회원정보 수정 화면(임시). 실제 컴포넌트로 대체 예정.</div>;
}
function DeleteAccount() { // [ADDED - TEMP]
    return <div>회원탈퇴 화면(임시). 실제 컴포넌트로 대체 예정.</div>;
}
function Support() { // [ADDED - TEMP]
    return <div>고객센터(임시). 실제 컴포넌트로 대체 예정.</div>;
}

// 현재 경로에 따라 NavBar 노출을 제어하는 내부 컴포넌트(단일 진입점)
function AppInner() {
    const location = useLocation();

    // /login에서 NavBar 숨김 (필요하면 배열로 확장 가능)
    const hideNav = location.pathname === "/login";

    return (
        <Suspense fallback={<CircularProgress />}>
            {/* 조건부 렌더링: /login이면 NavBar 숨김 */}
            {!hideNav && <NavigationBarApp />}

            {/* Routes도 여기서만 정의 (중복 제거) */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* 고객센터 라우트 */}
                <Route path="/support" element={<Support />} /> {/* [ADDED] */}

                {/* 마이페이지: 보호 라우트 + 중첩 라우팅 */}
                <Route
                    path="/mypage"
                    element={
                        <ProtectedRoute> {/* [ADDED] */}
                            <MyPageLayout /> {/* [ADDED] */}
                        </ProtectedRoute>
                    }
                >
                    {/* 기본 접속 시 /mypage/profile 로 리다이렉트 */}
                    <Route index element={<Navigate to="profile" replace />} /> {/* [ADDED] */}
                    <Route path="profile" element={<Profile />} /> {/* [ADDED] */}
                    <Route path="edit" element={<EditProfile />} /> {/* [ADDED] */}
                    <Route path="delete" element={<DeleteAccount />} /> {/* [ADDED] */}
                </Route>

                {/* 존재하지 않는 경로 처리 */}
                <Route path="*" element={<Navigate to="/" replace />} /> {/* [ADDED] */}
            </Routes>
        </Suspense>
    );
}

const container = document.getElementById("app") as HTMLElement;
if (!container) {
    throw new Error("Root container #app not found");
}

const root = ReactDOM.createRoot(container);
root.render(<App />);

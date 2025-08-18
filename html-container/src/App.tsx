import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/mypage/Profile"; // 실제 페이지 임포트 사용
import EditProfile from "./pages/mypage/EditProfile.tsx";
import DeleteAccount from "./pages/mypage/DeleteAccount.tsx";

import { CircularProgress } from "@mui/material";
import { BrowserRouter, Route, Routes, useLocation, Navigate, NavLink, Outlet } from "react-router-dom";

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
function isLoggedIn() {
    return !!localStorage.getItem("accessToken");
}

// 보호 라우팅: 비로그인 시 /login 으로 이동
function ProtectedRoute({ children }: { children: JSX.Element }) {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// 마이페이지 레이아웃 (서브탭 바)
function MyPageLayout() {
    return (
        <div style={{ padding: "24px" }}>
            <Outlet />
        </div>
    );
}

/* 임시 페이지들: 이름을 바꿔서 충돌 제거 */
function TempEditProfile() { // 이름 변경
    return <div>회원정보 수정 화면(임시). 실제 컴포넌트로 대체 예정.</div>;
}
function TempDeleteAccount() { // 이름 변경
    return <div>회원탈퇴 화면(임시). 실제 컴포넌트로 대체 예정.</div>;
}
function Support() {
    return <div>고객센터(임시). 실제 컴포넌트로 대체 예정.</div>;
}

function AppInner() {
    const location = useLocation();
    const hideNav = location.pathname === "/login";

    return (
        <Suspense fallback={<CircularProgress />}>
            {/* 조건부 렌더링: /login이면 NavBar 숨김 */}
            {!hideNav && <NavigationBarApp />}

            {/* 라우트 추가 위치는 여기(그대로 유지) */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route path="/support" element={<Support />} />

                {/* 마이페이지: 보호 라우트 + 중첩 라우팅 */}
                <Route
                    path="/mypage"
                    element={
                        <ProtectedRoute>
                            <MyPageLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* 기본 접속 시 /mypage/profile 로 리다이렉트 */}
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<Profile />} /> {/* 실제 Profile.tsx 사용 */}
                    <Route path="edit" element={<EditProfile />} />
                    <Route path="delete" element={<DeleteAccount  />} />
                </Route>

                {/* 존재하지 않는 경로 처리 */}
                <Route path="*" element={<Navigate to="/" replace />} />
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

import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Home from "./pages/Home";
import Login from "./pages/Login";

import { CircularProgress } from "@mui/material";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

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
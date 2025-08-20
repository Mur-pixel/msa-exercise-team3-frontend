import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { KAKAO_REDIRECT_URI, tokenEndpointUrl } from "../../config/auth";

export default function KakaoCallback() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const run = async () => {
            const qs = new URLSearchParams(search);
            const code = qs.get("code");
            const state = qs.get("state");
            const prev = sessionStorage.getItem("kakao_oauth_state");

            if (!code) { setError("인가 코드가 없습니다."); return; }
            if (!prev || prev !== state) { setError("상태 값이 일치하지 않습니다."); return; }

            // 교환 요청
            try {
                const res = await fetch(tokenEndpointUrl(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // 서버가 쿠키로 세션/리프레시 발급 시
                    body: JSON.stringify({ code, redirectUri: KAKAO_REDIRECT_URI }),
                });
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`로그인 실패: ${res.status} ${txt}`);
                }
                const json = await res.json().catch(() => ({} as any));

                // 서버가 accessToken을 바디로 주는 경우 (케이스1)
                if (json.accessToken) {
                    localStorage.setItem("accessToken", json.accessToken);
                }
                // 서버가 HttpOnly 쿠키로만 주는 경우(케이스2): 위 `credentials: "include"` 가 중요

                // 로그인 후 이동 (기본: 홈)
                const returnTo = sessionStorage.getItem("return_to") || "/";
                sessionStorage.removeItem("return_to");
                navigate(returnTo, { replace: true });
            } catch (e: any) {
                setError(e.message || "네트워크 오류");
            }
        };
        run();
    }, [navigate, search]);

    return (
        <div style={{ padding: 24 }}>
            {error ? <div className="tl-empty">로그인 실패: {error}</div> : <div className="tl-empty">카카오 로그인 처리 중…</div>}
        </div>
    );
}

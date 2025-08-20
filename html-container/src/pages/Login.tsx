// src/pages/Login.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

import kakaoLogo from "../assets/social/kakao.png";
import naverLogo from "../assets/social/naver.png";

declare global {
    interface Window {
        google?: any;
    }
}

// 안전하게 env 읽기 (rspack에서도 동작하도록 any 캐스팅)
const M = (typeof import.meta !== "undefined" ? (import.meta as any).env : {}) || {};

// 백엔드 오리진(팝업 최종 페이지가 postMessage를 보낼 origin)
// 예) 개발: http://127.0.0.1:7777  /  배포: https://api.your-domain.com
const API_ORIGIN: string = M.VITE_API_ORIGIN || "http://127.0.0.1:7777";

// 카카오 인증 시작 엔드포인트
// - 백엔드에서 카카오 authorize URL로 302 리다이렉트 해주는 API
// - devServer 프록시를 쓸 거면 경로만 써도 OK.
const KAKAO_START_PATH: string =
    M.VITE_KAKAO_START_PATH || "/account/kakao-authentication/start";

export default function Login() {
    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    // 이메일/비밀번호 각각의 에러 상태
    const [idError, setIdError] = useState<string | null>(null);
    const [pwError, setPwError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    // ====== Google One Tap 데모 콜백 ======
    const handleGoogleCredential = (response: any) => {
        const credential = response?.credential;
        if (!credential) return;
        // 데모: 실제론 credential 서버 검증
        // alert("Google credential: " + credential.slice(0, 16) + "...");
    };

    // ====== Google 버튼 렌더 (SDK 로드 후) ======
    useEffect(() => {
        let timer: number | undefined;

        const init = () => {
            const g = window.google?.accounts?.id;
            if (!g) return false;

            const htmlClientId =
                document.getElementById("g_id_onload")?.getAttribute("data-client_id") || undefined;

            if (!htmlClientId) {
                console.error("Google Client ID가 없습니다. index.html의 #g_id_onload 확인");
                return false;
            }

            g.initialize({
                client_id: htmlClientId,
                callback: handleGoogleCredential,
                ux_mode: "popup",
            });

            const el = document.getElementById("gsi-btn"); // 버튼을 렌더링할 자리
            if (el) {
                g.renderButton(el, {
                    type: "icon", // 아이콘 전용
                    shape: "circle",
                    size: "large",
                    theme: "outline",
                });
                return true;
            }
            return false;
        };

        if (!init()) {
            // SDK가 늦게 로드될 수 있으니 폴링
            timer = window.setInterval(() => {
                if (init()) window.clearInterval(timer);
            }, 200) as unknown as number;
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, []);

    // ====== 기본 로그인 제출 (데모) ======
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIdError(null);
        setPwError(null);

        if (!id.trim()) {
            setIdError("이메일을 입력해 주세요.");
            return;
        }
        if (!pw.trim()) {
            setPwError("비밀번호를 입력해 주세요.");
            return;
        }

        try {
            setSubmitting(true);
            // TODO: 실제 백엔드 연동
            await new Promise((r) => setTimeout(r, 700)); // 데모
            // alert(`로그인 시도: ${id}`);
        } catch (err) {
            setPwError("아이디 또는 비밀번호를 확인해 주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    // ====== 카카오 팝업 + postMessage 수신 ======
    const popupRef = useRef<Window | null>(null);

    useEffect(() => {
        const onMessage = (ev: MessageEvent) => {
            // 백엔드(팝업 페이지)의 오리진 검증 (http://.. 또는 https://.. 포함)
            if (ev.origin !== API_ORIGIN) return;

            try {
                const data = ev.data as
                    | { userToken: string; user: { name: string; email: string } }
                    | {
                    newUser: true;
                    loginType: "KAKAO";
                    temporaryUserToken: string;
                    user: { name: string; email: string };
                };

                // 기존 사용자
                if ((data as any).userToken) {
                    const { userToken, user } = data as any;
                    localStorage.setItem("accessToken", userToken);
                    localStorage.setItem("user", JSON.stringify(user));
                    // 전역 알림 → App의 useAuthSync 훅이 감지
                    window.dispatchEvent(new CustomEvent("auth:changed"));
                    // 메인으로 이동
                    navigate("/", { replace: true });
                }
                // 신규 사용자 (추가정보 페이지로 유도)
                else if ((data as any).newUser) {
                    const { temporaryUserToken, user } = data as any;
                    localStorage.setItem("temporaryUserToken", temporaryUserToken);
                    localStorage.setItem("user", JSON.stringify(user));
                    window.dispatchEvent(new CustomEvent("auth:changed"));
                    // TODO: 신규 가입 추가정보 페이지로 이동
                    navigate("/", { replace: true });
                }
            } finally {
                // 팝업 닫기
                if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
                popupRef.current = null;
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [navigate]);

    // 팝업 열기
    const openKakaoPopup = useCallback(() => {
        const w = 460;
        const h = 680;
        const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
        const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;

        // dev: 프록시 사용 시 PATH만 호출 → http://localhost:5000/account/... 로 뜸
        // prod: VITE_KAKAO_START_PATH를 절대 URL로 넣어도 됩니다.
        popupRef.current = window.open(
            KAKAO_START_PATH,
            "kakao-login",
            `width=${w},height=${h},left=${x},top=${y},resizable=no,scrollbars=yes`
        );

        if (!popupRef.current) {
            alert("팝업이 차단되었습니다. 브라우저 팝업 허용을 확인해 주세요.");
        }
    }, []);

    return (
        <div className="login-wrap">
            <header className="login-logo">
                <div className="logo-mark">🌊</div>
                <h1>Place Data</h1>
            </header>

            <form className="login-card" onSubmit={onSubmit} noValidate>
                {/* 아이디(이메일) */}
                <div className="field">
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="아이디(이메일)를 입력해 주세요."
                        aria-label="아이디(이메일)"
                        autoComplete="username"
                        className="input"
                    />
                    {idError && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {idError}
                        </p>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className="field">
                    <input
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="비밀번호를 입력해 주세요."
                        aria-label="비밀번호"
                        autoComplete="current-password"
                        className="input"
                    />
                    {pwError && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {pwError}
                        </p>
                    )}
                </div>

                <button className="login-btn" disabled={submitting}>
                    {submitting ? "로그인 중..." : "로그인"}
                </button>

                <div className="help-links">
                    <a href="/find-id">아이디 찾기</a>
                    <span className="divider">|</span>
                    <a href="/find-password">비밀번호 찾기</a>
                </div>

                {/* 소셜 로그인 */}
                <div className="sns-row" aria-label="소셜 로그인">
                    {/* 카카오: 팝업 + postMessage */}
                    <button
                        type="button"
                        className="sns sns--kakao"
                        onClick={openKakaoPopup}
                        aria-label="카카오로 로그인"
                        title="카카오 로그인"
                    >
                        <img src={kakaoLogo} alt="카카오" className="sns-icon" />
                    </button>

                    {/* 네이버: 자리만 유지 (나중에 연동) */}
                    <button
                        type="button"
                        className="sns sns--naver"
                        onClick={() => alert("네이버 로그인")}
                        aria-label="네이버로 로그인"
                    >
                        <img src={naverLogo} alt="네이버" className="sns-icon" />
                    </button>

                    {/* 구글: OAuth 리다이렉트 (데모) */}
                    <button
                        type="button"
                        className="sns sns--google"
                        onClick={() => (window.location.href = "/oauth2/authorization/google")}
                        aria-label="구글로 로그인"
                        title="Sign in with Google"
                    >
                        <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                    </button>

                    {/* 구글 버튼을 렌더링할 숨김 타겟 (경고 방지) */}
                    <div id="gsi-btn" style={{ display: "none" }} />
                </div>

                {/* 공지 */}
                <p className="notice">
                    개인정보 보호를 위해 공유 PC에서 사용 시
                    <br /> SNS 계정의 로그아웃 상태를 꼭 확인해 주세요.
                </p>

                <a href="/signup" className="signup-btn" role="button">
                    회원가입
                </a>
            </form>

            <footer className="login-footer">© Place Data</footer>
        </div>
    );
}

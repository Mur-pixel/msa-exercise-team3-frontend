import React, { useEffect, useState } from "react";
import "./login.css";

import kakaoLogo from "../assets/social/kakao.png";
import naverLogo from "../assets/social/naver.png";

declare global {
    interface Window {
        google?: any;
    }
}

export default function Login() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    // 이메일/비밀번호 각각의 에러 상태를 분리
    const [idError, setIdError] = useState<string | null>(null);
    const [pwError, setPwError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    // 구글 로그인 콜백: credential(JWT)을 서버로 보내 검증하세요.
    const handleGoogleCredential = (response: any) => {
        const credential = response?.credential;
        if (!credential) return;
        // TODO: 서버로 전달해서 검증 (aud/iss/exp, 서명 확인)
        // await fetch("/api/auth/google", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ credential }) })
        alert("Google credential 받은 상태(데모): " + credential.slice(0, 16) + "...");
    };

    // 구글 버튼 렌더 (SDK 로드 후 실행)
    useEffect(() => {
        let timer: number | undefined;

        const init = () => {
            const g = window.google?.accounts?.id;
            if (!g) return false;

            // index.html의 g_id_onload에 박아둔 client_id를 재사용
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
                    type: "icon",           // 아이콘 전용
                    shape: "circle",        // 동그란 형태
                    size: "large",          // small | medium | large
                    theme: "outline",       // outline | filled_blue | filled_black
                });
                return true;
            }
            return false;
        };

        // SDK가 늦게 로드될 수 있으니 폴링
        if (!init()) {
            timer = window.setInterval(() => {
                if (init()) window.clearInterval(timer);
            }, 200) as unknown as number;
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 제출 시 기존 에러 초기화
        setIdError(null);
        setPwError(null);

        // 이메일 비었을 때
        if (!id.trim()) {
            setIdError("이메일을 입력해 주세요.");
            return;
        }
        // 비밀번호 비었을 때
        if (!pw.trim()) {
            setPwError("비밀번호를 입력해 주세요.");
            return;
        }

        try {
            setSubmitting(true);
            // TODO: 실제 백엔드 연동
            // const { data } = await axios.post("/api/auth/login", { id, pw });
            await new Promise((r) => setTimeout(r, 700)); // 데모용
            alert(`로그인 시도: ${id}`);
        } catch (err) {
            // 공통 실패 메시지를 비밀번호 칸 하단에 노출 (원하면 토스트 등으로 분리 가능)
            setPwError("아이디 또는 비밀번호를 확인해 주세요.");
        } finally {
            setSubmitting(false);
        }
    };

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
                    {/* 이메일 에러 메시지 */}
                    {idError && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {idError}
                        </p>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className="field">{/* has-right-icon 제거 */}
                    <input
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="비밀번호를 입력해 주세요."
                        aria-label="비밀번호"
                        autoComplete="current-password"
                        className="input"
                    />
                    {/* 비밀번호 에러 메시지 */}
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

                {/* 소셜 로그인 섹션 (카카오 → 네이버 → 구글 순) */}
                <div className="sns-row" aria-label="소셜 로그인">
                    {/* 카카오: 로컬 PNG 아이콘 */}
                    <button
                        type="button"
                        className="sns sns--kakao"                // 스타일 클래스 변경
                        onClick={() => alert("카카오 로그인")}
                        aria-label="카카오로 로그인"
                    >
                        <img src={kakaoLogo} alt="카카오" className="sns-icon" />  {/* 이미지 아이콘 */}
                    </button>

                    {/* 네이버: 로컬 PNG 아이콘 */}
                    <button
                        type="button"
                        className="sns sns--naver"                // 스타일 클래스 변경
                        onClick={() => alert("네이버 로그인")}
                        aria-label="네이버로 로그인"
                    >
                        <img src={naverLogo} alt="네이버" className="sns-icon" />  {/* 이미지 아이콘 */}
                    </button>

                    {/* 구글: 인라인 SVG 아이콘 + OAuth 리다이렉트 */}
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
                </div>

                {/* 아래 알럿(공지) – 기존 스타일 그대로 사용 */}
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

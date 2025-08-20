// src/pages/auth/SignUp.tsx
import React, { useState } from "react";
import "../login.css"; // 기존 로그인 CSS 재사용(경로에 맞게 조정)

import { useNavigate } from "react-router-dom";
import { loginAccount, myProfile, registerAccount } from "../../services/account";

export default function SignUp() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [nickName, setNickName] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");

    const [errors, setErrors] = useState<{ email?: string; nickName?: string; pw?: string; pw2?: string; common?: string }>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const next: typeof errors = {};
        if (!email.trim()) next.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "올바른 이메일 형식이 아닙니다.";
        if (!nickName.trim()) next.nickName = "닉네임을 입력해 주세요.";
        if (!pw) next.pw = "비밀번호를 입력해 주세요.";
        else if (pw.length < 6) next.pw = "비밀번호는 6자 이상이어야 합니다.";
        if (pw2 !== pw) next.pw2 = "비밀번호가 일치하지 않습니다.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        try {
            setSubmitting(true);
            // 1) 회원가입
            await registerAccount({ email: email.trim(), password: pw, nickName: nickName.trim() });

            // 2) 바로 로그인
            const { token } = await loginAccount({ email: email.trim(), password: pw });

            // 3) 토큰 저장 + 프로필 저장(네비 표시용)
            localStorage.setItem("accessToken", token);
            const profile = await myProfile(token).catch(() => null);
            if (profile) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        email: profile.email,
                        nickName: profile.nickName,
                        id: profile.id,
                    })
                );
            }

            // 4) 네비게이션에게 로그인됨 알림(이미 카카오 로그인 때 쓰던 패턴과 동일)
            window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isLoggedIn: true } }));

            // 5) 홈으로 이동
            nav("/", { replace: true });
        } catch (err: any) {
            const msg =
                typeof err?.message === "string" && err.message.includes("unique")
                    ? "이미 가입된 이메일일 수 있어요."
                    : err?.message || "회원가입 중 오류가 발생했습니다.";
            setErrors((p) => ({ ...p, common: msg }));
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
                <h2 className="login-title" style={{ marginBottom: 12 }}>회원가입</h2>

                {/* 이메일 */}
                <div className="field">
                    <input
                        type="email"
                        className="input"
                        placeholder="이메일을 입력해 주세요."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        aria-label="이메일"
                    />
                    {errors.email && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {errors.email}
                        </p>
                    )}
                </div>

                {/* 닉네임 */}
                <div className="field">
                    <input
                        type="text"
                        className="input"
                        placeholder="닉네임을 입력해 주세요."
                        value={nickName}
                        onChange={(e) => setNickName(e.target.value)}
                        aria-label="닉네임"
                    />
                    {errors.nickName && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {errors.nickName}
                        </p>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className="field">
                    <input
                        type="password"
                        className="input"
                        placeholder="비밀번호 (6자 이상)"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        autoComplete="new-password"
                        aria-label="비밀번호"
                    />
                    {errors.pw && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {errors.pw}
                        </p>
                    )}
                </div>

                {/* 비밀번호 확인 */}
                <div className="field">
                    <input
                        type="password"
                        className="input"
                        placeholder="비밀번호 확인"
                        value={pw2}
                        onChange={(e) => setPw2(e.target.value)}
                        autoComplete="new-password"
                        aria-label="비밀번호 확인"
                    />
                    {errors.pw2 && (
                        <p className="error">
                            <span className="error-icon">ⓘ</span> {errors.pw2}
                        </p>
                    )}
                </div>

                {/* 공통 에러 */}
                {errors.common && (
                    <p className="error" role="alert">
                        <span className="error-icon">ⓘ</span> {errors.common}
                    </p>
                )}

                <button className="login-btn" disabled={submitting}>
                    {submitting ? "가입 중..." : "회원가입"}
                </button>

                <div className="help-links">
                    <a href="/login">이미 계정이 있으신가요? 로그인</a>
                </div>
            </form>

            <footer className="login-footer">© Place Data</footer>
        </div>
    );
}

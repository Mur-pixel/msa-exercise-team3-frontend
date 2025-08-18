import React, { useState } from "react";
import "./Profile.css";        // 공통 레이아웃 재사용 (pf-*)
import "./EditProfile.css";    // 입력/버튼 기본 스타일 재사용 (ep-*)
import "./DeleteAccount.css";  // 탈퇴 페이지 전용 보정 (da-*)

/** 회원탈퇴 페이지 */
export default function DeleteAccount() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || loading) return;

        // 안전장치
        const ok = window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
        if (!ok) return;

        try {
            setLoading(true);
            // TODO: 실제 API 호출
            // await api.deleteAccount({ password });

            // 데모: 로컬 상태 정리 후 홈으로
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            alert("탈퇴가 완료되었습니다.");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            alert("탈퇴 요청에 실패했습니다. 비밀번호를 확인 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pf-wrap">
            {/* 카드와 같은 폭으로 정렬하기 위한 래퍼 */}
            <div className="pf-narrow">
                {/* 상단 타이틀 */}
                <section className="pf-head">
                    <h1 className="pf-title">회원탈퇴</h1>
                    <p className="pf-desc">안전한 탈퇴를 위해 비밀번호를 다시 확인합니다.</p>
                </section>
            </div>

            {/* 입력 카드 (560px) */}
            <form className="pf-card ep-form" onSubmit={onSubmit}>
                <div className="da-section-title">비밀번호 확인</div> {/* 굵은 섹션 타이틀 */}

                <div className="da-input-row">
                    <input
                        className="ep-input"
                        type="password"
                        placeholder="현재 비밀번호를 입력하세요."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-label="현재 비밀번호"
                        required
                    />
                </div>

                <div className="ep-actions">
                    <button
                        type="submit"
                        className="da-danger"    // 빨간 '탈퇴하기' 버튼
                        disabled={!password || loading}
                        aria-disabled={!password || loading}
                    >
                        {loading ? "처리 중..." : "탈퇴하기"}
                    </button>
                </div>
            </form>
        </div>
    );
}

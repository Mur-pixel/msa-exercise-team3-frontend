import React, { useMemo, useState } from "react";
import "./Profile.css";              // 프로필 공통 스타일 재사용
import "./EditProfile.css";          // 입력 폼 전용 보조 스타일

type User = {
    email: string;
    nickname?: string;
};

export default function EditProfile() {
    // 데모용: localStorage의 user 정보 사용
    const stored = localStorage.getItem("user");
    const user: User =
        (stored && JSON.parse(stored)) || { email: "example@example.com", nickname: "" };

    // 폼 상태
    const [nickname, setNickname] = useState("");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [loading, setLoading] = useState(false);

    // 간단 유효성
    const isValid = useMemo(() => {
        const nickOk = nickname.length === 0 || nickname.length >= 2; // 닉네임은 선택 입력, 있으면 2자+
        const curOk = currentPw.length >= 4;                           // 데모: 4자 이상
        const newOk = newPw.length >= 6;                               // 데모: 6자 이상
        return nickOk && curOk && newOk;
    }, [nickname, currentPw, newPw]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || loading) return;

        try {
            setLoading(true);

            // 실제로는 여기서 API 호출
            // await api.updateProfile({ nickname, currentPw, newPw });

            // 데모: 성공 가정, localStorage 닉네임 갱신
            const next = { ...user, nickname: nickname || user.nickname };
            localStorage.setItem("user", JSON.stringify(next));

            alert("회원정보가 수정되었습니다.");
            setNickname("");
            setCurrentPw("");
            setNewPw("");
        } catch (err) {
            console.error(err);
            alert("수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pf-wrap">
            {/* ★ 카드와 같은 폭으로 정렬하기 위한 래퍼 */}
            <div className="pf-narrow">    {/* ★ 추가 */}
                <section className="pf-head">
                    <h1 className="pf-title">회원정보 수정</h1>
                    <p className="pf-desc">수정할 내용을 입력하고 ‘수정 완료’ 버튼을 눌러주세요.</p>
                </section>

                <section className="pf-toprow">
                    <div className="pf-name">
                        <span className="pf-name-label">이름</span>
                        <span className="pf-chip">{user.email}</span>
                    </div>
                </section>
            </div>

            {/* 입력 폼 카드 */}
            <form className="pf-card ep-form" onSubmit={onSubmit}> {/* ep-form: 보조 스타일 */}
                <div className="pf-row">
                    <div className="pf-label">새 닉네임</div>
                    <div className="pf-value">
                        <input
                            className="ep-input"
                            type="text"
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            aria-label="새 닉네임"
                        />
                        <div className="ep-hint">공백 제외 2자 이상 (미입력 시 변경 안 함)</div>
                    </div>
                </div>

                <div className="pf-row">
                    <div className="pf-label">현재 비밀번호</div>
                    <div className="pf-value">
                        <input
                            className="ep-input"
                            type="password"
                            placeholder="비밀번호를 입력하세요."
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                            aria-label="현재 비밀번호"
                            required
                        />
                    </div>
                </div>

                <div className="pf-row">
                    <div className="pf-label">새 비밀번호</div>
                    <div className="pf-value">
                        <input
                            className="ep-input"
                            type="password"
                            placeholder="비밀번호를 다시 한 번 입력하세요."
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            aria-label="새 비밀번호"
                            required
                        />
                        <div className="ep-hint">6자 이상 권장</div>
                    </div>
                </div>

                <div className="ep-actions"> {/* 버튼 영역 */}
                    <button
                        type="submit"
                        className="ep-submit"
                        disabled={!isValid || loading}
                        aria-disabled={!isValid || loading}
                    >
                        {loading ? "처리 중..." : "수정 완료"}
                    </button>
                </div>
            </form>
        </div>
    );
}

import React from "react";
import "./Profile.css";

// 실제 데이터가 있다면 props/context/API로 바꾸면 됨
type ProfileData = {
    email: string;
    name?: string;
    nickname?: string;
    birth?: string; // YYYY-MM-DD
    avatarUrl?: string;
};

export default function Profile() {
    // 데모용: localStorage의 user를 읽고, 없으면 예시 표시
    const stored = localStorage.getItem("user");
    const user: ProfileData =
        (stored && JSON.parse(stored)) || {
            email: "example@example.com",
            name: "〇〇〇",
            nickname: "닉네임",
            birth: "〇〇〇〇.〇〇.〇〇.",
        };

    // 이 페이지에 들어오면 상단 서브탭(.pd-subtabs) 숨기기
    // useEffect(() => {
    //     document.body.classList.add("pf-hide-subtabs"); // NavBar의 서브탭을 CSS로 숨김
    //     return () => document.body.classList.remove("pf-hide-subtabs");
    // }, []);


    return (
        <div className="pf-wrap">
            {/* 카드와 같은 폭(560px)으로 맞추는 래퍼 */}
            <div className="pf-narrow">
                {/* 타이틀 영역 */}
                <section className="pf-head">
                    <h1 className="pf-title">내프로필</h1>
                    <p className="pf-desc">내 계정 정보를 한눈에 확인할 수 있는 프로필 화면입니다.</p>
                </section>

                {/* 이름 + 이메일칩 */}
                <section className="pf-toprow">
                    <div className="pf-name-col">
                        <div className="pf-name">
                            <span className="pf-name-label">이름</span>
                            <span className="pf-chip">{user.email}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* 카드: 계정 정보 */}
            <section className="pf-card">
                <div className="pf-card-title">계정 정보</div>
                <div className="pf-row">
                    <div className="pf-label">대표 이메일</div>
                    <div className="pf-value">{user.email}</div>
                </div>
                <div className="pf-row">
                    <div className="pf-label">이름</div>
                    <div className="pf-value pf-dots">{user.name}</div>
                </div>
            </section>

            {/*/!* 카드: 프로필 정보 *!/*/}
            {/*<section className="pf-card">*/}
            {/*    <div className="pf-card-title">프로필 정보</div>*/}
            {/*    <div className="pf-row">*/}
            {/*        <div className="pf-label">닉네임</div>*/}
            {/*        <div className="pf-value pf-dots">〇〇〇</div>*/}
            {/*    </div>*/}
            {/*    <div className="pf-row">*/}
            {/*        <div className="pf-label">생년월일</div>*/}
            {/*        <div className="pf-value pf-dots">〇〇〇〇.〇〇.〇〇.</div>*/}
            {/*    </div>*/}
            {/*</section>*/}
        </div>
    );
}

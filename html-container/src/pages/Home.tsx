import React, { useEffect, useRef, useState } from "react";
import "./home.css";

import kwanganImg from "../assets/01.jpg";
import AnmokImg from "../assets/02.jpg";
import HwaseongImg from "../assets/03.jpg";
import JuknokwonImg from "../assets/04.jpg";
import PohangImg from "../assets/05.jpg";
import KkotjiImg from "../assets/06.jpg";
import SeopjikojiImg from "../assets/07.jpg";
import JumunjinportImg from "../assets/08.jpg";
import HajodaeImg from "../assets/09.jpg";
import DaedunsanImg from "../assets/10.jpg";

const AUTOPLAY = 7000; // 7초 동안 진행바가 차오르고 다음 장으로 이동

/** 카드에 들어갈 데이터 타입 */
type PlaceCard = {
    id: number;
    title: string;
    location: string;
    image: string; // 배경 이미지 URL
};

const SAMPLE_PLACES: PlaceCard[] = [
    { id: 1, title: "해운대 & 광안대교", location: "부산광역시", image: kwanganImg },
    { id: 2, title: "안목해변", location: "강원특별자치도 강릉시", image: AnmokImg },
    { id: 3, title: "화성행궁", location: "경기도 수원시", image: HwaseongImg },
    { id: 4, title: "죽녹원", location: "전라남도 담양군", image: JuknokwonImg },
    { id: 5, title: "포항 호미곶", location: "경상북도 포항시", image: PohangImg },
    { id: 6, title: "태안 꽃지해수욕장", location: "충청남도 태안군", image: KkotjiImg },
    { id: 7, title: "제주 섭지코지", location: "제주특별자치도 서귀포시", image: SeopjikojiImg },
    { id: 8, title: "강릉 주문진항", location: "강원특별자치도 강릉시", image: JumunjinportImg },
    { id: 9, title: "양양 하조대", location: "강원특별자치도 양양군", image: HajodaeImg },
    { id: 10, title: "대둔산 도립공원", location: "전북특별자치도 완주군", image: DaedunsanImg },
];

export default function Home() {
    const railRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(true);

    // 진행바 애니메이션 재시작용 key
    const [progressKey, setProgressKey] = useState(0);

    // 카드 하나의 전체 폭(마진 포함)을 계산
    const cardWidth = useCardFullWidth(railRef);

    // 스크롤 → 현재 인덱스 동기화
    useEffect(() => {
        const rail = railRef.current;
        if (!rail || !cardWidth) return;

        let af = 0;
        const onScroll = () => {
            cancelAnimationFrame(af);
            af = requestAnimationFrame(() => {
                const nextIdx = Math.round(rail.scrollLeft / cardWidth);
                setCurrent(clamp(nextIdx, 0, SAMPLE_PLACES.length - 1));
            });
        };
        rail.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            rail.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(af);
        };
    }, [cardWidth]);

    // 특정 인덱스로 스크롤 이동
    const goTo = (idx: number) => {
        const rail = railRef.current;
        if (!rail || !cardWidth) return;
        const max = SAMPLE_PLACES.length - 1;
        const next = ((idx % (max + 1)) + (max + 1)) % (max + 1);
        rail.scrollTo({ left: next * cardWidth, behavior: "smooth" });
        setCurrent(next);

        // 슬라이드가 바뀔 때마다 진행바 애니메이션 재시작
        setProgressKey((k) => k + 1);
    };

    const onPrev = () => goTo(current - 1);
    const onNext = () => goTo(current + 1);

    return (
        <div className="home-wrap">
            <section className="hero">
                <h1 className="hero-title">당신의 힐링 여행을 찾아드립니다</h1>
                <p className="hero-sub">맘에 드는 여행 카드를 넘겨보세요</p>
            </section>

            <section className="carousel">
                <div className="rail" ref={railRef}>
                    {SAMPLE_PLACES.map((p, i) => (
                        <article
                            key={p.id}
                            className={`card ${i === current ? "is-active" : ""}`}
                            style={{ backgroundImage: `url(${p.image})` }}
                            aria-label={`${p.title}, ${p.location}`}
                        >
                            <div className="card-gradient" />
                            <div className="card-text">
                                <strong className="card-title">{p.title}</strong>
                                <span className="card-location">{p.location}</span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* 진행선 */}
                <div className="progress" aria-hidden>
                    <div
                        key={progressKey} // ← 매 슬라이드 전환마다 재생성되어 애니메이션 리셋
                        className="bar"
                        style={{
                            animationDuration: `${AUTOPLAY}ms`,
                            animationPlayState: playing ? "running" : "paused",
                            visibility: cardWidth ? "visible" : "hidden", // 첫 측정 전 깜빡임 방지
                        }}
                        onAnimationEnd={() => {
                            // 진행바가 끝나면 다음 슬라이드로
                            if (playing) goTo(current + 1);
                        }}
                    />
                </div>

                {/* 컨트롤 */}
                <div className="controls">
                    <button
                        className="ctrl"
                        onClick={() => {
                            // 재생/일시정지 토글 시 진행바도 리셋
                            setPlaying((v) => {
                                const next = !v;
                                if (next) setProgressKey((k) => k + 1);
                                return next;
                            });
                        }}
                    >
                        {playing ? "Ⅱ" : "▶"}
                    </button>
                    <button className="ctrl" onClick={onPrev} aria-label="이전">
                        ‹
                    </button>
                    <button className="ctrl" onClick={onNext} aria-label="다음">
                        ›
                    </button>
                    <span className="counter">
            {current + 1} / {SAMPLE_PLACES.length}
          </span>
                </div>
            </section>
        </div>
    );
}

/** rail 내부 첫 카드의 margin 포함 폭 계산 */
function useCardFullWidth(railRef: React.RefObject<HTMLDivElement>) {
    const [w, setW] = useState(0);

    useEffect(() => {
        const container = railRef.current;
        if (!container) return;

        const measure = () => {
            const first = container.querySelector<HTMLElement>(".card"); // 첫 카드
            if (!first) return;
            const style = getComputedStyle(first);
            const margin =
                parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            setW(first.offsetWidth + margin); // 카드 폭 + 좌우 마진
        };

        measure(); // 초기 측정
        const ro = new ResizeObserver(measure); // 컨테이너 변화 감지
        ro.observe(container);
        window.addEventListener("resize", measure); // 창 크기 변화 대응

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [railRef]);

    return w;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

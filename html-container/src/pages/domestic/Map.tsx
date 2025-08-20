import { useEffect, useRef, useState } from "react";

const koreaSvgUrl = new URL('../../assets/svg/korea_simple.svg', import.meta.url).toString();

import "./Map.css";

const REGIONS = ["서울","인천","경기","강원","충북","충남","전북","전남","경북","경남","부산","대구","광주","울산","세종","제주"];
const ALIAS: Record<string,string> = {
    "서울특별시":"서울","인천광역시":"인천","경기도":"경기","강원도":"강원",
    "충청북도":"충북","충청남도":"충남","전라북도":"전북","전라남도":"전남",
    "경상북도":"경북","경상남도":"경남","세종특별자치시":"세종",
    "제주특별자치도":"제주","제주도":"제주",
    "seoul":"서울","incheon":"인천","gyeonggi":"경기","gangwon":"강원",
    "chungbuk":"충북","chungnam":"충남","jeonbuk":"전북","jeonnam":"전남",
    "gyeongbuk":"경북","gyeongnam":"경남","jeju":"제주",
};

type Props = {
    selectedRegion?: string | null;
    onRegionClick?: (region: string) => void;
};

export default function Map({ selectedRegion, onRegionClick }: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [svgMarkup, setSvgMarkup] = useState<string>("");  // fetch된 SVG 텍스트
    const [wired, setWired] = useState(false);

    // 1) 번들된 SVG URL에서 실제 텍스트 읽기 (SVGR 필요 X)
    useEffect(() => {
        let alive = true;
        fetch(koreaSvgUrl)
            .then(r => r.text())
            .then(txt => { if (alive) setSvgMarkup(txt); })
            .catch(() => setSvgMarkup(""));
        return () => { alive = false; };
    }, []);

    const clean = (s?: string | null) => (s ?? "").trim().toLowerCase();
    const toRegion = (raw?: string | null): string | null => {
        if (!raw) return null;
        const k = clean(raw).replace(/[^가-힣a-z]/g, "");
        if (!k) return null;
        const exact = REGIONS.find(r => clean(r) === k); if (exact) return exact;
        if (ALIAS[k]) return ALIAS[k];
        for (const r of REGIONS) if (k.includes(clean(r))) return r;
        return null;
    };
    const readName = (el: Element | null): string | null => {
        if (!el) return null;
        const attrs = ["data-name","data-region","name","id","aria-label"];
        for (const a of attrs) { const v = el.getAttribute(a); if (v) return v; }
        const t = el.querySelector("title"); if (t?.textContent) return t.textContent;
        return null;
    };
    const resolveUse = (svg: SVGSVGElement, useEl: SVGUseElement): Element | null => {
        const href = (useEl.getAttribute("href") || useEl.getAttribute("xlink:href") || "").trim();
        if (!href.startsWith("#")) return null;
        return svg.querySelector(href);
    };

    // 2) SVG가 DOM에 삽입된 뒤, 클릭/하이라이트 바인딩
    useEffect(() => {
        if (!svgMarkup || !wrapperRef.current) return;

        const host = wrapperRef.current;
        host.innerHTML = svgMarkup;                 // 실제 SVG DOM 삽입
        const svg = host.querySelector("svg") as SVGSVGElement | null;
        if (!svg) return;

        // 인라인 스타일/채움 제거 → CSS로 통일
        svg.querySelectorAll("style").forEach(s => s.remove());
        svg.removeAttribute("fill");
        svg.querySelectorAll<SVGElement>("*").forEach(el => el.removeAttribute("fill"));

        // 실제 화면에 그려지는 요소 우선(<use> 많으면 그걸로)
        const uses = Array.from(svg.querySelectorAll<SVGUseElement>("use"));
        const shapes = Array.from(svg.querySelectorAll<SVGGraphicsElement>("path, polygon, rect"));
        const nodes: SVGGraphicsElement[] = uses.length > 0 ? uses : shapes;

        const clickable: SVGGraphicsElement[] = [];
        nodes.forEach((node, i) => {
            // 이름 찾기: 자기 → <use> 원본 → 조상
            let raw = readName(node);
            if (!raw && node.tagName.toLowerCase() === "use") {
                const base = resolveUse(svg, node as unknown as SVGUseElement);
                raw = readName(base) || base?.id || null;
            }
            if (!raw) {
                let p: Element | null = node;
                for (let hop = 0; hop < 5 && p; hop++, p = p.parentElement) {
                    if (p.id) { raw = p.id; break; }
                }
            }

            const region = toRegion(raw);
            if (region) {
                node.dataset.canonical = region;
                node.classList.add("map-region");
                (node.style as any).pointerEvents = "auto";
                if (!node.id) node.id = `region-${i+1}`;
                clickable.push(node);
            } else {
                node.classList.add("map-silhouette");
                (node.style as any).pointerEvents = "none";
            }
        });

        const onClick = (e: Event) => {
            const el = e.currentTarget as SVGGraphicsElement;
            const r = el.dataset.canonical;
            if (!r) return;
            clickable.forEach(x => x.classList.remove("active"));
            el.classList.add("active");
            onRegionClick?.(r);
        };
        clickable.forEach(n => n.addEventListener("click", onClick));

        setWired(true);
        return () => { clickable.forEach(n => n.removeEventListener("click", onClick)); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgMarkup]);

    // 3) 외부 선택 상태 → SVG 하이라이트 동기화
    useEffect(() => {
        if (!wired || !wrapperRef.current) return;
        const svg = wrapperRef.current.querySelector("svg");
        if (!svg) return;
        svg.querySelectorAll<SVGGraphicsElement>(".map-region.active").forEach(n => n.classList.remove("active"));
        if (!selectedRegion) return;
        const hit = Array.from(svg.querySelectorAll<SVGGraphicsElement>(".map-region"))
            .find(n => n.dataset.canonical === selectedRegion);
        hit?.classList.add("active");
    }, [wired, selectedRegion]);

    return (
        <div className="map-wrapper">
            {/* 여기서 실제 SVG가 주입됨 */}
            <div ref={wrapperRef} className="korea-map" />
        </div>
    );
}

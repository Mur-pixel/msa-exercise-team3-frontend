import { useEffect, useMemo, useRef, useState } from "react";
import Map from "./Map";
import RegionList from "./RegionList";
import "./Domestic.css";

import { listPlaces, searchPlaces, PlaceItem } from "../../api/places.ts";

const REGIONS = [
    "전국","서울","세종","부산","인천","경기","강원","충북","충남",
    "전북","전남","경북","경남","광주","대구","울산","제주"
];

/** 프론트(짧은) → 백엔드(DB, 긴) */
const API_LOCATION: Record<string, string> = {
    서울: "서울특별시",
    인천: "인천광역시",
    부산: "부산광역시",
    대구: "대구광역시",
    광주: "광주광역시",
    울산: "울산광역시",
    세종: "세종특별자치시",
    경기: "경기도",
    강원: "강원특별자치도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전라북도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
};
const toApiLocation = (r: string | null) => (r && r !== "전국" ? (API_LOCATION[r] ?? r) : null);

export default function Domestic() {
    const [selectedRegion, setSelectedRegion] = useState("전국");
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<PlaceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const aborter = useRef<AbortController | null>(null);

    const debounce = useMemo(() => {
        let t: any;
        return (fn: () => void, ms = 300) => { clearTimeout(t); t = setTimeout(fn, ms); };
    }, []);

    const load = (region = selectedRegion, keyword = search) => {
        aborter.current?.abort();
        const ac = new AbortController();
        aborter.current = ac;
        setLoading(true);
        setError(null);

        const isAll = region === "전국" && !keyword.trim();
        const p = isAll
            ? listPlaces()
            : searchPlaces({ title: keyword, category: null, location: toApiLocation(region) });

        p.then((data) => { if (!ac.signal.aborted) setItems(Array.isArray(data) ? data : []); })
            .catch((e) => { if (!ac.signal.aborted) { setError((e as any)?.message ?? "불러오기 오류"); setItems([]); }})
            .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    };

    useEffect(() => { load(selectedRegion, search); }, [selectedRegion]);
    useEffect(() => { debounce(() => load(selectedRegion, search), 350); }, [search]);

    return (
        <div className="domestic-container">
            <div className="domestic-inner">
                <div className="main-content">
                    {/* 좌측: 지도 패널 (고정 높이, 내부는 꽉 채움) */}
                    <div className="map-box panel">
                        <div className="map-flex">
                            <Map
                                selectedRegion={selectedRegion === "전국" ? null : selectedRegion}
                                onRegionClick={setSelectedRegion}
                            />
                            <p className="map-note">※ SVG 지도입니다. 현재 선택: <span className="highlight">{selectedRegion}</span></p>
                        </div>
                    </div>

                    {/* 우측: 리스트 패널 (같은 높이, STEP_2만 스크롤) */}
                    <div className="list-box panel">
                        {/* 고정 영역(스크롤 없음): STEP_1 칩 + STEP_2 헤더/검색 */}
                        <div className="list-static">
                            <div className="step-label">STEP_1 지역 선택</div>
                            <div className="region-tags" aria-label="지역 선택 칩">
                                {REGIONS.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        className={`region-tag ${selectedRegion === r ? "selected" : ""}`}
                                        onClick={() => setSelectedRegion(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="list-header">
                                <div className="step-label" style={{ margin: 0 }}>STEP_2 여행지 리스트</div>
                                <input
                                    className="search-input"
                                    placeholder="제목 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {error && <p className="status status-error">⚠ {error}</p>}
                            {loading && <p className="status status-loading">불러오는 중...</p>}
                        </div>

                        {/* 스크롤 영역: 실제 결과 리스트만 */}
                        <div className="results-scroll">
                            <RegionList selectedRegion={selectedRegion} items={items} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

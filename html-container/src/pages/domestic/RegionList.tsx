import "./RegionList.css";
import { PlaceItem } from "../../api/places.ts";

export interface RegionListProps {
    selectedRegion: string;
    items?: PlaceItem[];
}

/** 긴 이름 → 짧은 이름 매핑 */
const LONG_TO_SHORT: Record<string, string> = {
    서울특별시: "서울",
    인천광역시: "인천",
    부산광역시: "부산",
    대구광역시: "대구",
    광주광역시: "광주",
    울산광역시: "울산",
    세종특별자치시: "세종",
    경기도: "경기",
    강원도: "강원",
    강원특별자치도: "강원",
    충청북도: "충북",
    충청남도: "충남",
    전라북도: "전북",
    전라남도: "전남",
    경상북도: "경북",
    경상남도: "경남",
    제주특별자치도: "제주",
};

function normalizeToShort(loc?: string | null): string | null {
    if (!loc) return null;
    // 만약 DB에 '인천광역시 중구 …'처럼 시/도 뒤에 구/군이 붙어있으면 앞 단어만 취함
    const first = loc.trim().split(/\s+/)[0];
    return LONG_TO_SHORT[first] ?? first;
}

const RegionList: React.FC<RegionListProps> = ({ selectedRegion, items = [] }) => {
    const safe = Array.isArray(items) ? items : [];
    const filtered =
        selectedRegion === "전국"
            ? safe
            : safe.filter((m) => normalizeToShort(m.location) === selectedRegion);

    if (filtered.length === 0) {
        return <p className="regionlist-empty">조건에 맞는 결과가 없어요.</p>;
    }

    return (
        <ul className="regionlist-ul">
            {filtered.map((m, idx) => (
                <li key={m.place_id ?? `${m.title}-${idx}`} className="regionlist-li">
                    <div className="regionlist-item">
                        <div>
                            <p className="regionlist-title">{m.title}</p>
                            <p className="regionlist-sub">
                                지역: {m.location ?? "-"}{m.category ? ` · 카테고리: ${m.category}` : ""}
                            </p>
                            {m.address && <p className="regionlist-sub">주소: {m.address}</p>}
                            {m.message && <p className="regionlist-sub">메시지: {m.message}</p>}
                        </div>
                        <div className="regionlist-date">
                            {m.place_id ? `ID: ${m.place_id}` : ""}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default RegionList;

// pages/theme/ThemeCategoryRow.tsx
import React from "react";
import "./Theme.css";

export type ThemeCategoryItem = {
    value: string;
    label: string;
    image?: string;
};

type Props = {
    categories?: ThemeCategoryItem[];   // 안전하게 옵셔널
    value?: string;
    onChange: (next: string) => void;
    allowUnselect?: boolean;
};

export default function ThemeCategoryRow({
                                             categories = [],          // 기본값
                                             value = "",
                                             onChange,
                                             allowUnselect = true,
                                         }: Props) {
    const handleClick = (v: string) => {
        if (allowUnselect && v === value) onChange("");
        else onChange(v);
    };

    return (
        <div className="tc-wrap" role="tablist" aria-label="카테고리">
            {categories.map((c) => {
                const active = value === c.value;
                return (
                    <button
                        key={c.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`tc-item ${active ? "is-active" : ""}`}
                        onClick={() => handleClick(c.value)}
                        title={c.label}
                    >
            <span className="tc-thumb">
              {c.image ? (
                  <img className="tc-img" src={c.image} alt="" loading="lazy" />
              ) : (
                  <span className="tc-fallback" aria-hidden />
              )}
                <span className="tc-overlay" aria-hidden />
            </span>
                        <span className="tc-label">{c.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

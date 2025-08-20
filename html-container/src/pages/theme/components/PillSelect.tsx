// components/PillSelect.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export type Option = { value: string; label: string };

type Props = {
    id?: string;
    value: string;
    options: Option[];
    onChange: (v: string) => void;
    className?: string;        // e.g. "tl-searchbar__select"와 같이 넘겨도 됨
    placeholder?: string;
};

export default function PillSelect({
                                       id,
                                       value,
                                       options,
                                       onChange,
                                       className = "",
                                       placeholder = "선택",
                                   }: Props) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = useMemo(
        () => options.find((o) => o.value === value),
        [options, value]
    );

    // 외부 클릭 닫기
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // 키보드
    const [focusIdx, setFocusIdx] = useState(
        Math.max(0, options.findIndex((o) => o.value === value))
    );
    const openMenu = () => {
        setOpen(true);
        setFocusIdx(Math.max(0, options.findIndex((o) => o.value === value)));
    };
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); openMenu(); return;
        }
        if (!open) return;

        if (e.key === "Escape") { setOpen(false); return; }
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const opt = options[focusIdx];
            if (opt) onChange(opt.value);
            setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusIdx((i) => Math.min(options.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusIdx((i) => Math.max(0, i - 1));
        } else if (e.key === "Home") {
            setFocusIdx(0);
        } else if (e.key === "End") {
            setFocusIdx(options.length - 1);
        }
    };

    const menuId = id ? `${id}-listbox` : undefined;

    return (
        <div
            ref={rootRef}
            className={`pill-select ${className}`}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-owns={menuId}
            aria-controls={menuId}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onClick={() => setOpen((s) => !s)}
        >
            <input id={id} className="pill-select__inputMirror" readOnly value={selected?.label ?? ""} />
            <div className="pill-select__value">{selected?.label ?? placeholder}</div>
            <span className={`pill-select__arrow ${open ? "is-open" : ""}`} aria-hidden>▾</span>

            {open && (
                <div className="pill-select__menu" role="listbox" id={menuId}>
                    {options.map((o, idx) => {
                        const selected = o.value === value;
                        const focused = idx === focusIdx;
                        return (
                            <div
                                key={o.value}
                                role="option"
                                aria-selected={selected}
                                className={`pill-select__option ${selected ? "is-selected" : ""} ${focused ? "is-active" : ""}`}
                                onMouseEnter={() => setFocusIdx(idx)}
                                onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false); }}
                            >
                                {o.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

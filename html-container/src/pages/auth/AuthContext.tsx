import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { name?: string; email?: string } | null;

type AuthContextValue = {
    token: string | null;
    user: User;
    login: (token: string, user?: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
    const [user, setUser] = useState<User>(() => {
        const raw = localStorage.getItem("user");
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    });

    const login = (t: string, u?: User) => {
        setToken(t);
        setUser(u ?? null);
        localStorage.setItem("accessToken", t);
        if (u) localStorage.setItem("user", JSON.stringify(u));
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: { token: t, user: u ?? null } }));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: { token: null, user: null } }));
    };

    // 다른 탭/창과 동기화(선택)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "accessToken") setToken(localStorage.getItem("accessToken"));
            if (e.key === "user") {
                const raw = localStorage.getItem("user");
                try { setUser(raw ? JSON.parse(raw) : null); } catch { setUser(null); }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

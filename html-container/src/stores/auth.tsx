import { createContext, useContext, useEffect, useState } from "react";

type User = { email: string; nickname?: string };
type AuthCtx = {
    isLoggedIn: boolean;
    user: User | null;
    login: (t: string, u: User) => void;
    logout: () => void;
};
const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const t = localStorage.getItem("accessToken");
        const u = localStorage.getItem("user");
        if (t && u) setUser(JSON.parse(u));
    }, []);
    const login = (t: string, u: User) => {
        localStorage.setItem("accessToken", t);
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
    };
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
    };
    return (
        <Ctx.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
            {children}
        </Ctx.Provider>
    );
}
export const useAuth = () => useContext(Ctx);

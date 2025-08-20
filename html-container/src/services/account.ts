// src/services/account.ts
type RegisterReq = { email: string; password: string; nickName: string };
type LoginReq = { email: string; password: string };

type LoginRes =
    | { token?: string; accessToken?: string; userToken?: string; message?: string }
    | any;

type ProfileRes = {
    id?: number;
    email?: string;
    nickName?: string;
    loginType?: string;
    [k: string]: any;
};

const API_BASE: string =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ACCOUNT_API_BASE) ||
    "/account";

export async function registerAccount(body: RegisterReq) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`회원가입 실패: ${res.status} ${msg || ""}`);
    }
    return res.json().catch(() => ({}));
}

export async function loginAccount(body: LoginReq) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`로그인 실패: ${res.status} ${msg || ""}`);
    }
    const json: LoginRes = await res.json().catch(() => ({}));
    // 백엔드가 token 필드명을 다양하게 줄 수 있어 대비
    const token = json.token || json.accessToken || json.userToken;
    if (!token) throw new Error(json.message || "토큰을 받지 못했습니다.");
    return { token, message: json.message };
}

export async function myProfile(token: string): Promise<ProfileRes> {
    const res = await fetch(`${API_BASE}/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`프로필 조회 실패: ${res.status}`);
    return res.json();
}

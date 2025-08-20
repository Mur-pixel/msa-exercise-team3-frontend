export const ACCOUNT_BASE =
    (import.meta as any).env?.VITE_ACCOUNT_BASE || "";

export const KAKAO_CLIENT_ID =
    (import.meta as any).env?.VITE_KAKAO_CLIENT_ID;

export const KAKAO_REDIRECT_URI =
    (import.meta as any).env?.VITE_KAKAO_REDIRECT_URI || "http://localhost:5000/oauth/kakao/callback";

export const KAKAO_TOKEN_ENDPOINT =
    (import.meta as any).env?.VITE_KAKAO_TOKEN_ENDPOINT || "/auth/kakao";

// 프록시를 쓰면 상대경로(/auth/kakao)로 호출되고,
// 프록시를 안 쓰면 ACCOUNT_BASE + KAKAO_TOKEN_ENDPOINT 로 절대경로 호출
export const tokenEndpointUrl = () =>
    KAKAO_TOKEN_ENDPOINT.startsWith("http")
        ? KAKAO_TOKEN_ENDPOINT
        : (ACCOUNT_BASE ? `${ACCOUNT_BASE}${KAKAO_TOKEN_ENDPOINT}` : KAKAO_TOKEN_ENDPOINT);

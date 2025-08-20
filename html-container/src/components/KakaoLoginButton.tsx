import React, { useCallback, useEffect, useRef } from "react";

// 백엔드(팝업 최종 페이지)가 메시지를 보내는 "보내는 쪽(origin)".
// dev 프록시를 쓰더라도 최종 redirect는 백엔드 도메인으로 떨어집니다.
const DEFAULT_BACKEND_ORIGIN =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_ORIGIN) ||
    "http://127.0.0.1:7777"; // 배포에선 https://api.yourdomain.com 등으로 교체(.env)

type KakaoPayloadExisting = {
    userToken: string;
    user: { name: string; email: string };
};

type KakaoPayloadNew = {
    newUser: true;
    loginType: "KAKAO";
    temporaryUserToken: string;
    user: { name: string; email: string };
};

type Props = {
    className?: string;
    onSuccess?: (token: string, user: { name: string; email: string }) => void;
    onNewUser?: (tmpToken: string, user: { name: string; email: string }) => void;
    onError?: (err: any) => void;
};

export default function KakaoLoginButton({
                                             className,
                                             onSuccess,
                                             onNewUser,
                                             onError,
                                         }: Props) {
    const popupRef = useRef<Window | null>(null);

    // 메시지 수신
    useEffect(() => {
        const handler = (ev: MessageEvent) => {
            try {
                // 보낸 쪽(origin)은 "백엔드"입니다 (백엔드가 반환하는 HTML에서 postMessage를 호출)
                if (ev.origin !== DEFAULT_BACKEND_ORIGIN) {
                    // 다른 출처면 무시
                    return;
                }

                const data = ev.data as KakaoPayloadExisting | KakaoPayloadNew;

                // ① 기존 사용자
                if ((data as KakaoPayloadExisting).userToken) {
                    const { userToken, user } = data as KakaoPayloadExisting;
                    // 로그인 토큰 저장 (앱이 사용하는 키 사용)
                    localStorage.setItem("accessToken", userToken);
                    onSuccess?.(userToken, user);
                }
                // ② 신규 사용자(필요시 회원가입 추가 단계로 유도)
                else if ((data as KakaoPayloadNew).newUser) {
                    const { temporaryUserToken, user } = data as KakaoPayloadNew;
                    onNewUser?.(temporaryUserToken, user);
                    // 필요하다면 임시 토큰도 저장:
                    // localStorage.setItem("temporaryUserToken", temporaryUserToken);
                }
            } catch (e) {
                onError?.(e);
            } finally {
                // 팝업 정리
                if (popupRef.current && !popupRef.current.closed) {
                    popupRef.current.close();
                }
                popupRef.current = null;
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [onError, onNewUser, onSuccess]);

    // 팝업 열기
    const openPopup = useCallback(() => {
        //    백엔드 컨트롤러가 카카오로 리다이렉트까지 핸들: /account/kakao-authentication/login
        //    여기에서 바로 여는 게 아니라 "카카오 권한 동의 페이지"를 열어야 해서,
        //    백엔드 redirectUri가 /account/kakao-authentication/login으로 등록되어 있어야 합니다.
        //
        //    실무에선 /account/kakao-authentication/start 같은 엔드포인트를 만들어
        //    서버가 loginUrl/oauth/authorize?client_id=... 로 302 리다이렉트 하게 하는 게 가장 깔끔합니다.
        //
        // 지금은 프론트에서 "카카오 권한 페이지"를 직접 열 수 있도록 백엔드 설정값이 필요하지만
        // 노출을 원치 않으면 /start 엔드포인트를 하나 추가해 주세요.
        //
        // 우선은 백엔드에 /start 추가했다고 가정하고 아래 URL로 팝업을 엽니다:
        const url = "/account/kakao-authentication/start"; // (프록시 통해 8080→카카오로 302)

        const w = 460;
        const h = 680;
        const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
        const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;

        popupRef.current = window.open(
            url,
            "kakao-login",
            `width=${w},height=${h},left=${x},top=${y},resizable=no,scrollbars=yes`
        );
        if (!popupRef.current) {
            onError?.(new Error("팝업 차단: 창을 열 수 없습니다."));
        }
    }, [onError]);

    return (
        <button type="button" className={className} onClick={openPopup} aria-label="카카오로 로그인">
            {/* 아이콘/라벨은 페이지 스타일에 맞게 */}
            <img src="/assets/social/kakao.png" alt="카카오" style={{ width: 24, height: 24, marginRight: 8 }} />
            카카오 로그인
        </button>
    );
}

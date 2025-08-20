// src/ErrorBoundary.tsx
import React from "react";
export class ErrorBoundary extends React.Component<
    { fallback?: React.ReactNode },
    { hasError: boolean; error?: any }
> {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, info: any) { console.error("ErrorBoundary caught:", error, info); }
    render() { return this.state.hasError ? (this.props.fallback ?? <div style={{padding:16}}>문제가 발생했습니다.</div>) : this.props.children; }
}

/**
 * Lightweight toast system — no external dependency.
 *
 * Usage:
 *   import { toast } from "./Toast";
 *   toast.success("Saved!");
 *   toast.error("Something went wrong.");
 *   toast.info("Loading data…");
 *   toast.warn("No available assets.");
 *
 * Mount <Toaster /> once in App.jsx (or MainLayout) to render toasts.
 */

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

// ── Internal event bus ────────────────────────────────────────────
const listeners = [];
let uid = 0;

function emit(type, message, duration = 3500) {
    const id = ++uid;
    listeners.forEach(fn => fn({ id, type, message, duration }));
    return id;
}

// ── Public API ────────────────────────────────────────────────────
export const toast = {
    success: (msg, dur) => emit("success", msg, dur),
    error:   (msg, dur) => emit("error",   msg, dur ?? 5000),
    info:    (msg, dur) => emit("info",    msg, dur),
    warn:    (msg, dur) => emit("warn",    msg, dur),
};

// ── Config per type ───────────────────────────────────────────────
const TYPE = {
    success: {
        icon: CheckCircle,
        bar:  "#19405e",
        bg:   "#f0f7f4",
        border:"#b7d9cc",
        text: "#19405e",
    },
    error: {
        icon: XCircle,
        bar:  "#dc2626",
        bg:   "#fff5f5",
        border:"#fca5a5",
        text: "#991b1b",
    },
    info: {
        icon: Info,
        bar:  "#1b4f72",
        bg:   "#eff6ff",
        border:"#bfdbfe",
        text: "#1e40af",
    },
    warn: {
        icon: AlertTriangle,
        bar:  "#d97706",
        bg:   "#fffbeb",
        border:"#fde68a",
        text: "#92400e",
    },
};

// ── Single toast item ─────────────────────────────────────────────
function ToastItem({ id, type, message, duration, onRemove }) {

    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const timerRef = useRef(null);
    const cfg = TYPE[type] ?? TYPE.info;
    const Icon = cfg.icon;

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onRemove(id), 280);
    }, [id, onRemove]);

    useEffect(() => {
        // Double rAF ensures the element is painted at opacity:0 first,
        // then transitions to opacity:1 — survives React batched re-renders.
        const raf1 = requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });
        timerRef.current = setTimeout(dismiss, duration);
        return () => {
            cancelAnimationFrame(raf1);
            clearTimeout(timerRef.current);
        };
    }, [dismiss, duration]);

    return (
        <div
            role="alert"
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                minWidth: "280px",
                maxWidth: "380px",
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderLeft: `3px solid ${cfg.bar}`,
                borderRadius: "8px",
                padding: "10px 12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                fontFamily: "'Roboto Condensed', sans-serif",
                fontSize: "13px",
                color: cfg.text,
                transition: "opacity 0.25s ease, transform 0.25s ease",
                opacity: visible && !leaving ? 1 : 0,
                transform: visible && !leaving ? "translateX(0)" : "translateX(28px)",
                pointerEvents: "all",
                cursor: "default",
                marginBottom: "8px",
            }}
        >
            <Icon size={16} style={{ color: cfg.bar, flexShrink: 0, marginTop: "1px" }} />

            <span style={{ flex: 1, lineHeight: 1.45 }}>{message}</span>

            <button
                onClick={dismiss}
                style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: cfg.text,
                    opacity: 0.5,
                    flexShrink: 0,
                    lineHeight: 1,
                    marginTop: "1px",
                }}
                aria-label="Dismiss"
            >
                <X size={13} />
            </button>
        </div>
    );
}

// ── Container rendered at root ────────────────────────────────────
export function Toaster() {

    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (t) => setToasts(prev => [...prev, t]);
        listeners.push(handler);
        return () => {
            const i = listeners.indexOf(handler);
            if (i > -1) listeners.splice(i, 1);
        };
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <div
            aria-live="polite"
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "flex-end",
                pointerEvents: "none",
            }}
        >
            {toasts.map(t => (
                <ToastItem key={t.id} {...t} onRemove={remove} />
            ))}
        </div>
    );
}

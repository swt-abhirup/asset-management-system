/**
 * Lightweight confirm dialog — replaces native confirm().
 *
 * Usage:
 *   import { confirm } from "./ConfirmDialog";
 *
 *   const ok = await confirm({
 *     title:   "Delete Asset?",
 *     message: "This cannot be undone.",
 *     confirm: "Delete",
 *     danger:  true,       // makes confirm button red
 *   });
 *   if (!ok) return;
 *   // … proceed
 *
 * Mount <ConfirmHost /> once in App.jsx alongside <Toaster />.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

// ── Internal bus ─────────────────────────────────────────────────
let _resolve = null;
let _setDialog = null;

export function confirm({ title = "Are you sure?", message = "", confirmLabel = "Confirm", danger = false }) {
    return new Promise(resolve => {
        _resolve = resolve;
        _setDialog?.({ open: true, title, message, confirmLabel, danger });
    });
}

// ── Host component — mount once in App.jsx ───────────────────────
export function ConfirmHost() {

    const [dialog, setDialog] = useState({ open: false });
    const confirmBtnRef = useRef(null);

    useEffect(() => { _setDialog = setDialog; }, []);

    // Focus confirm button when dialog opens
    useEffect(() => {
        if (dialog.open) setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }, [dialog.open]);

    const close = useCallback((result) => {
        setDialog(d => ({ ...d, open: false }));
        _resolve?.(result);
        _resolve = null;
    }, []);

    if (!dialog.open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => close(false)}
        >
            <div
                className="w-full rounded-xl shadow-2xl"
                style={{
                    maxWidth: "380px",
                    backgroundColor: "#ffffff",
                    margin: "16px",
                    fontFamily: "'Roboto Condensed', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: dialog.danger ? "rgba(220,38,38,0.1)" : "rgba(25,64,94,0.08)"
                            }}>
                            <AlertTriangle size={14}
                                style={{ color: dialog.danger ? "#dc2626" : "#19405e" }} />
                        </div>
                        <h3 className="text-sm font-bold leading-tight"
                            style={{
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                color: dialog.danger ? "#dc2626" : "#19405e"
                            }}>
                            {dialog.title}
                        </h3>
                    </div>
                    <button onClick={() => close(false)}
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#19405e"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        <X size={13} />
                    </button>
                </div>

                {/* Body */}
                {dialog.message && (
                    <p className="px-5 pb-4 text-xs leading-relaxed" style={{ color: "#64748b" }}>
                        {dialog.message}
                    </p>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "#f1f5f9" }}>
                    <button onClick={() => close(false)}
                        className="px-4 py-2 rounded text-xs font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        Cancel
                    </button>
                    <button ref={confirmBtnRef} onClick={() => close(true)}
                        className="px-4 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: dialog.danger ? "#dc2626" : "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = dialog.danger ? "#b91c1c" : "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = dialog.danger ? "#dc2626" : "#19405e"}>
                        {dialog.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

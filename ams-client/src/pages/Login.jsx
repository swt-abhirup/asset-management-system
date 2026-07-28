import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Mail, Lock, Eye, EyeOff } from "lucide-react";
import api        from "../services/api";
import { toast }  from "../components/Toast";

// ── Feature bullets on left panel ────────────────────────────────
const FEATURES = [
    "Real-time asset tracking & inventory",
    "Assignment & return lifecycle management",
    "Maintenance scheduling & repair requests",
    "Warranty expiry alerts & vendor management",
];

export default function Login() {

    const navigate = useNavigate();

    const [email,        setEmail]        = useState("");
    const [password,     setPassword]     = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading,      setLoading]      = useState(false);

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/api/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user",  JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex"
            style={{ backgroundColor: "#eef2f6", fontFamily: "'Roboto Condensed', sans-serif" }}>

            {/* ── Left branding panel ──────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden"
                style={{ backgroundColor: "#19405e" }}>

                {/* Decorative blobs */}
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-[0.07]"
                    style={{ backgroundColor: "#f5cba7" }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-[0.06]"
                    style={{ backgroundColor: "#f5cba7", transform: "translate(30%, 30%)" }} />

                {/* Content — vertically centered */}
                <div className="relative z-10 flex flex-col justify-between h-full px-10 py-10">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "#f5cba7" }}>
                            <Monitor size={15} style={{ color: "#19405e" }} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold leading-none tracking-wide"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                IT Asset Manager
                            </p>
                            <p className="text-xs leading-none mt-0.5" style={{ color: "#7aaec8" }}>
                                Enterprise Edition
                            </p>
                        </div>
                    </div>

                    {/* Headline */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                            style={{ color: "#f5cba7" }}>
                            IT Asset Management System
                        </p>
                        <h1 className="font-bold leading-tight mb-4"
                            style={{
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                color: "#ffffff",
                                fontSize: "clamp(1.6rem, 3vw, 2.4rem)"
                            }}>
                            One platform for your<br />
                            entire IT asset lifecycle
                        </h1>
                        <p className="text-sm leading-relaxed" style={{ color: "#8abdd8", maxWidth: "340px" }}>
                            Track, assign, and maintain all your organisation's
                            technology assets from a single unified platform.
                        </p>

                        {/* Feature list */}
                        <ul className="mt-6 flex flex-col gap-2.5">
                            {FEATURES.map((f, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: "rgba(245,203,167,0.18)" }}>
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#f5cba7"
                                                strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                    <span className="text-xs leading-relaxed" style={{ color: "#8abdd8" }}>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer */}
                    <p className="text-xs" style={{ color: "#4d7e9a" }}>
                        © {new Date().getFullYear()} IT Asset Manager · All rights reserved
                    </p>
                </div>
            </div>

            {/* ── Right login panel ────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full" style={{ maxWidth: "360px" }}>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <div className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ backgroundColor: "#19405e" }}>
                            <Monitor size={13} className="text-white" />
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#19405e", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            IT Asset Manager
                        </span>
                    </div>

                    {/* Card */}
                    <div className="rounded-xl"
                        style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 24px rgba(25,64,94,0.09)",
                            padding: "28px 28px 24px"
                        }}>

                        {/* Heading */}
                        <div className="mb-5">
                            <h2 className="font-bold leading-tight mb-0.5"
                                style={{
                                    fontFamily: "'Bricolage Grotesque', sans-serif",
                                    color: "#19405e",
                                    fontSize: "1.25rem"
                                }}>
                                Sign in
                            </h2>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>
                                Enter your credentials to access the portal
                            </p>
                        </div>

                        <form onSubmit={login} className="flex flex-col gap-3.5">

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold mb-1"
                                    style={{ color: "#1b4f72" }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail size={13}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#94a3b8" }} />
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full outline-none rounded-lg border text-xs"
                                        style={{
                                            padding: "8px 10px 8px 32px",
                                            borderColor: "#e2e8f0",
                                            color: "#1e293b",
                                            transition: "border-color 0.15s, box-shadow 0.15s"
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = "#19405e";
                                            e.target.style.boxShadow   = "0 0 0 3px rgba(25,64,94,0.1)";
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.boxShadow   = "none";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold mb-1"
                                    style={{ color: "#1b4f72" }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={13}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: "#94a3b8" }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full outline-none rounded-lg border text-xs"
                                        style={{
                                            padding: "8px 36px 8px 32px",
                                            borderColor: "#e2e8f0",
                                            color: "#1e293b",
                                            transition: "border-color 0.15s, box-shadow 0.15s"
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = "#19405e";
                                            e.target.style.boxShadow   = "0 0 0 3px rgba(25,64,94,0.1)";
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.boxShadow   = "none";
                                        }}
                                    />
                                    <button type="button" tabIndex={-1}
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "#94a3b8", lineHeight: 0 }}>
                                        {showPassword
                                            ? <EyeOff size={13} />
                                            : <Eye    size={13} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg text-white text-xs font-semibold disabled:opacity-60"
                                style={{
                                    backgroundColor: "#19405e",
                                    padding: "9px 0",
                                    marginTop: "2px",
                                    transition: "background-color 0.15s",
                                    letterSpacing: "0.03em"
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = "#19405e"; }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Signing in…
                                    </span>
                                ) : "Sign In →"}
                            </button>

                        </form>
                    </div>

                    {/* Below-card footnote */}
                    <div className="flex items-center justify-center gap-1.5 mt-4">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "#f5cba7" }} />
                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                            Secured with JWT · IT Asset Management System
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}

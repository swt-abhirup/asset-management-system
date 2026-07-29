import {
    LayoutDashboard, Monitor, Users, ClipboardList,
    Wrench, Tag, LogOut, ChevronRight, Menu, X,
    Hammer, ShieldAlert, Building2, ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

const NAV_GROUPS = [
    {
        label: "Core",
        links: [
            { path: "/dashboard",   label: "Dashboard",      icon: LayoutDashboard },
            { path: "/assets",      label: "Assets",          icon: Monitor         },
            { path: "/employees",   label: "Employees",       icon: Users           },
            { path: "/assignments", label: "Assignments",     icon: ClipboardList   },
            { path: "/categories",  label: "Categories",      icon: Tag             },
        ]
    },
    {
        label: "Operations",
        links: [
            { path: "/maintenance",     label: "Maintenance",     icon: Wrench      },
            { path: "/repair-requests", label: "Repair Requests", icon: Hammer      },
            { path: "/warranty-expiry", label: "Warranty Expiry", icon: ShieldAlert },
        ]
    },
    {
        label: "Procurement",
        links: [
            { path: "/vendors",   label: "Vendors",   icon: Building2    },
            { path: "/purchases", label: "Purchases", icon: ShoppingCart },
        ]
    },
];

export default function Sidebar() {

    const navigate            = useNavigate();
    const location            = useLocation();
    const { collapsed }       = useSidebar();
    const [mobileOpen, setMobileOpen] = useState(false);
    const user                = JSON.parse(localStorage.getItem("user") ?? "{}");
    const initials            = user?.fullname?.charAt(0)?.toUpperCase() ?? "U";

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Expose toggle so Navbar can open it on mobile
    useEffect(() => {
        window.__sidebarToggle = () => setMobileOpen(v => !v);
        return () => { delete window.__sidebarToggle; };
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const SidebarContent = ({ forceExpanded = false }) => {
        const show = forceExpanded || !collapsed;
        return (
            <>
                {/* ── Logo ────────────────────────────────── */}
                <div className="flex items-center px-3 border-b flex-shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.08)", height: "56px", minHeight: "56px" }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#f5cba7" }}>
                        <Monitor size={14} style={{ color: "#19405e" }} />
                    </div>
                    {show && (
                        <div className="ml-2.5 overflow-hidden whitespace-nowrap">
                            <p className="text-white text-xs font-bold leading-tight tracking-wide"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                IT Asset
                            </p>
                            <p className="text-xs leading-tight" style={{ color: "#a8c4d8" }}>Manager</p>
                        </div>
                    )}
                    {/* Close button — mobile drawer only */}
                    {forceExpanded && (
                        <button onClick={() => setMobileOpen(false)}
                            className="ml-auto w-7 h-7 rounded flex items-center justify-center"
                            style={{ color: "#a8c4d8" }}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* ── Navigation ──────────────────────────── */}
                <nav className="flex-1 min-h-0 px-1.5 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.12) transparent" }}>

                    {NAV_GROUPS.map(group => (
                        <div key={group.label} className="mb-2">
                            {show ? (
                                <p className="px-3 mb-1 font-semibold uppercase tracking-widest"
                                    style={{ color: "rgba(168,196,216,0.5)", fontSize: "9px" }}>
                                    {group.label}
                                </p>
                            ) : (
                                <div className="mx-2 mb-1.5 h-px" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
                            )}

                            {group.links.map(({ path, label, icon: Icon }) => {
                                const active = location.pathname === path;
                                return (
                                    <a key={path} href={path}
                                        title={!show ? label : undefined}
                                        className="flex items-center rounded text-xs font-medium relative"
                                        style={{
                                            gap: show ? "10px" : 0,
                                            padding: show ? "8px 12px" : "8px 0",
                                            justifyContent: show ? "flex-start" : "center",
                                            backgroundColor: active ? "rgba(245,203,167,0.15)" : "transparent",
                                            color: active ? "#f5cba7" : "#a8c4d8",
                                            textDecoration: "none",
                                            transition: "background-color 0.12s, color 0.12s",
                                        }}
                                        onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; }}}
                                        onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#a8c4d8"; }}}
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                                                style={{ backgroundColor: "#f5cba7" }} />
                                        )}
                                        <Icon size={15} style={{ flexShrink: 0 }} />
                                        {show && (
                                            <>
                                                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
                                                {active && <ChevronRight size={12} style={{ color: "#f5cba7", flexShrink: 0 }} />}
                                            </>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ── User + Logout ────────────────────────── */}
                <div className="flex-shrink-0 px-1.5 py-3 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <a href="/profile"
                        title={!show ? `${user?.fullname} — View Profile` : undefined}
                        className="flex items-center rounded mb-1"
                        style={{
                            gap: show ? "8px" : 0,
                            padding: show ? "8px 12px" : "8px 0",
                            justifyContent: show ? "flex-start" : "center",
                            textDecoration: "none",
                            transition: "background-color 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: "#f5cba7", color: "#19405e" }}>
                            {initials}
                        </div>
                        {show && (
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-medium truncate leading-tight">{user?.fullname}</p>
                                <p className="text-xs truncate leading-tight capitalize" style={{ color: "#a8c4d8" }}>
                                    {user?.role} · View Profile
                                </p>
                            </div>
                        )}
                    </a>
                    <button onClick={logout}
                        title={!show ? "Sign Out" : undefined}
                        className="flex items-center rounded w-full text-xs font-medium"
                        style={{
                            gap: show ? "10px" : 0,
                            padding: show ? "8px 12px" : "8px 0",
                            justifyContent: show ? "flex-start" : "center",
                            color: "#a8c4d8",
                            transition: "background-color 0.12s, color 0.12s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#a8c4d8"; }}>
                        <LogOut size={15} style={{ flexShrink: 0 }} />
                        {show && <span className="whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </>
        );
    };

    return (
        <>
            {/* ── Desktop sidebar (md+) ─────────────────── */}
            <aside className="hidden md:flex flex-col flex-shrink-0 sticky top-0 self-start"
                style={{
                    backgroundColor: "#19405e",
                    height: "100vh",        /* viewport-locked so it scrolls with sticky */
                    width: collapsed ? "56px" : "224px",
                    transition: "width 0.22s ease",
                    overflow: "hidden",
                    zIndex: 20,
                }}>
                <SidebarContent />
            </aside>

            {/* ── Mobile: hamburger button (in Navbar slot) ─ */}
            {/* The actual button lives in Navbar on mobile via window.__sidebarToggle */}

            {/* ── Mobile: backdrop ──────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* ── Mobile: slide-in drawer ───────────────── */}
            <aside className="fixed top-0 left-0 h-full z-50 flex flex-col md:hidden"
                style={{
                    backgroundColor: "#19405e",
                    width: "240px",
                    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.25s ease",
                    overflowX: "hidden",
                }}>
                <SidebarContent forceExpanded />
            </aside>
        </>
    );
}

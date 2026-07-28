import { useLocation } from "react-router-dom";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const PAGE_META = {
    "/dashboard":       { title: "Dashboard",        sub: "Overview of your IT assets"         },
    "/assets":          { title: "Assets",            sub: "Manage all IT hardware & devices"   },
    "/employees":       { title: "Employees",         sub: "Manage staff accounts"              },
    "/assignments":     { title: "Assignments",       sub: "Track asset allocation"             },
    "/maintenance":     { title: "Maintenance",       sub: "Repair & service logs"              },
    "/repair-requests": { title: "Repair Requests",   sub: "Track and resolve hardware issues"  },
    "/warranty-expiry": { title: "Warranty Expiry",   sub: "Monitor asset warranty status"      },
    "/vendors":         { title: "Vendors",           sub: "Manage supplier directory"          },
    "/purchases":       { title: "Purchase Orders",   sub: "Track procurement & payments"       },
    "/categories":      { title: "Asset Categories",  sub: "Organise asset types"               },
    "/profile":         { title: "My Profile",        sub: "Manage your account & preferences"  },
};

export default function Navbar() {

    const location        = useLocation();
    const { collapsed, toggle } = useSidebar();
    const user            = JSON.parse(localStorage.getItem("user") ?? "{}");
    const meta            = PAGE_META[location.pathname] ?? { title: "IT Asset Manager", sub: "" };
    const ToggleIcon      = collapsed ? PanelLeftOpen : PanelLeftClose;

    return (
        <header
            className="flex items-center justify-between px-4 border-b flex-shrink-0"
            style={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                minHeight: "56px",
                height: "56px",
            }}
        >
            {/* Left — toggle + page title */}
            <div className="flex items-center gap-3 min-w-0">

                {/* Collapse toggle */}
                <button
                    onClick={toggle}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{ color: "#64748b" }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                        e.currentTarget.style.color = "#19405e";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#64748b";
                    }}
                >
                    <ToggleIcon size={17} />
                </button>

                {/* Vertical divider */}
                <div className="h-5 w-px flex-shrink-0" style={{ backgroundColor: "#e2e8f0" }} />

                {/* Page title */}
                <div className="min-w-0">
                    <h1
                        className="text-sm font-bold leading-tight truncate"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}
                    >
                        {meta.title}
                    </h1>
                    {meta.sub && (
                        <p className="text-xs leading-tight mt-0.5 truncate hidden sm:block"
                            style={{ color: "#94a3b8" }}>
                            {meta.sub}
                        </p>
                    )}
                </div>
            </div>

            {/* Right — bell + user */}
            <div className="flex items-center gap-3 flex-shrink-0">

                {/* Notification bell */}
                <button
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ color: "#64748b" }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                        e.currentTarget.style.color = "#19405e";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#64748b";
                    }}
                >
                    <Bell size={16} />
                </button>

                <div className="w-px h-5" style={{ backgroundColor: "#e2e8f0" }} />

                {/* User chip */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "#19405e", color: "#f5cba7" }}
                    >
                        {user?.fullname?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-semibold leading-tight" style={{ color: "#19405e" }}>
                            {user?.fullname}
                        </p>
                        <p className="text-xs leading-tight capitalize" style={{ color: "#94a3b8" }}>
                            {user?.role}
                        </p>
                    </div>
                </div>

            </div>
        </header>
    );
}

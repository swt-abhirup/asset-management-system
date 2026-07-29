import Sidebar from "../components/Sidebar";
import Navbar   from "../components/Navbar";

/**
 * Shared layout for all protected pages.
 *
 * How the sidebar fill works:
 * - The outer wrapper uses the sidebar colour (#19405e) as its own background.
 * - The content column overlays the page background (#eef2f6) on top of that.
 * - Result: the sidebar colour naturally fills the full page height even when
 *   the content scrolls past 100vh — no gap below the nav links.
 * - The <aside> inside Sidebar is still sticky/height:100vh for proper scroll.
 */
export default function MainLayout({ children, mainClassName = "", mainStyle = {} }) {
    return (
        <div
            className="flex min-h-screen overflow-x-hidden"
            style={{ backgroundColor: "#19405e" }}   /* sidebar fill colour */
        >
            <Sidebar />

            {/* Content area — own background covers the sidebar colour below */}
            <div
                className="flex-1 flex flex-col min-w-0 min-h-screen"
                style={{
                    backgroundColor: "#eef2f6",
                    transition: "width 0.22s ease",
                }}
            >
                <Navbar />
                <main className={`flex-1 p-5 ${mainClassName}`} style={mainStyle}>
                    {children}
                </main>
            </div>
        </div>
    );
}

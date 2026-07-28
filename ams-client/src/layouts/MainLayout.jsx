import Sidebar from "../components/Sidebar";
import Navbar   from "../components/Navbar";

/**
 * Shared layout for all protected pages.
 * mainClassName / mainStyle allow pages to customise the <main> element.
 */
export default function MainLayout({ children, mainClassName = "", mainStyle = {} }) {
    return (
        <div className="flex min-h-screen overflow-x-hidden" style={{ backgroundColor: "#eef2f6" }}>

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0" style={{ transition: "width 0.22s ease" }}>
                <Navbar />
                <main className={`flex-1 p-5 ${mainClassName}`} style={mainStyle}>
                    {children}
                </main>
            </div>

        </div>
    );
}

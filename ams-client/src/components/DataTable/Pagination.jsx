export default function Pagination({
    currentPage,
    totalPages,
    rowsPerPage,
    totalRecords,
    onPageChange,
    onRowsPerPageChange
}) {

    // Show at most 5 page buttons around current
    const buildPages = () => {
        const pages = [];
        const delta = 2;
        const left  = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        if (left > 1)          { pages.push(1); if (left > 2) pages.push("…"); }
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }
        return pages;
    };

    const from = Math.min((currentPage - 1) * rowsPerPage + 1, totalRecords);
    const to   = Math.min(currentPage * rowsPerPage, totalRecords);

    return (

        <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Record count */}
            <p className="text-xs" style={{ color: "#94a3b8" }}>
                Showing <span className="font-semibold" style={{ color: "#19405e" }}>{from}–{to}</span> of{" "}
                <span className="font-semibold" style={{ color: "#19405e" }}>{totalRecords}</span>
            </p>

            <div className="flex items-center gap-3">

                {/* Rows per page */}
                <div className="flex items-center gap-1.5">
                    <label className="text-xs" style={{ color: "#94a3b8" }}>Rows</label>
                    <select
                        value={rowsPerPage}
                        onChange={e => onRowsPerPageChange(Number(e.target.value))}
                        className="text-xs border rounded px-1.5 py-1 outline-none"
                        style={{ borderColor: "#e2e8f0", color: "#19405e" }}
                    >
                        {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                {/* Page buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center border disabled:opacity-30"
                        style={{ borderColor: "#e2e8f0", color: "#19405e" }}
                    >
                        ‹
                    </button>

                    {buildPages().map((p, i) =>
                        p === "…" ? (
                            <span key={`e${i}`} className="w-6 h-6 flex items-center justify-center text-xs" style={{ color: "#94a3b8" }}>…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className="w-6 h-6 rounded text-xs flex items-center justify-center border font-medium"
                                style={{
                                    backgroundColor: p === currentPage ? "#19405e" : "transparent",
                                    borderColor:     p === currentPage ? "#19405e" : "#e2e8f0",
                                    color:           p === currentPage ? "#ffffff"  : "#19405e"
                                }}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center border disabled:opacity-30"
                        style={{ borderColor: "#e2e8f0", color: "#19405e" }}
                    >
                        ›
                    </button>
                </div>

            </div>

        </div>

    );

}

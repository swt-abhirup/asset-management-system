import { useMemo, useState, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";
import Loading from "./Loading";

export default function DataTable({
    columns,
    data,
    renderActions,
    loading = false
}) {

    const [currentPage,  setCurrentPage]  = useState(1);
    const [rowsPerPage,  setRowsPerPage]  = useState(10);
    const [sortConfig,   setSortConfig]   = useState({ key: "", direction: "asc" });

    // ── Reset to page 1 whenever filter/search produces a different result set ──
    // Use length + first-item key as a lightweight identity check to avoid
    // resetting on every object reference change from useMemo rebuilds.
    const dataKey = data.length > 0
        ? `${data.length}-${data[0]?.asset_id ?? data[0]?.email ?? data[0]?.assignment_id ?? data[0]?.log_id ?? data[0]?.request_id ?? 0}`
        : "empty";

    useEffect(() => {
        setCurrentPage(1);
    }, [dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return [...data];
        return [...data].sort((a, b) => {
            const va = a[sortConfig.key] ?? "";
            const vb = b[sortConfig.key] ?? "";
            if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
            if (va > vb) return sortConfig.direction === "asc" ?  1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const totalPages   = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
    const safePage     = Math.min(currentPage, totalPages);
    const firstRow     = (safePage - 1) * rowsPerPage;
    const paginatedData = sortedData.slice(firstRow, firstRow + rowsPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
        setCurrentPage(1);
    };

    if (loading) {
        return <Loading rows={8} columns={columns.length + 2} />;
    }

    return (

        <div
            className="rounded-lg overflow-hidden"
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
        >
            {data.length === 0 ? (

                <EmptyState title="No Records Found" message="Nothing to display yet." />

            ) : (

                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">

                        <thead>
                            <tr style={{ backgroundColor: "#19405e" }}>
                                <th className="px-3 py-2.5 text-left font-semibold w-10" style={{ color: "#a8c4d8" }}>
                                    #
                                </th>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className="px-3 py-2.5 text-left font-semibold cursor-pointer select-none"
                                        style={{ color: "#a8c4d8" }}
                                        onMouseEnter={e => e.currentTarget.style.color = "#f5cba7"}
                                        onMouseLeave={e => e.currentTarget.style.color = "#a8c4d8"}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            {sortConfig.key !== col.key
                                                ? <ArrowUpDown size={11} style={{ color: "#4a6f8a" }} />
                                                : sortConfig.direction === "asc"
                                                    ? <ArrowUp   size={11} style={{ color: "#f5cba7" }} />
                                                    : <ArrowDown size={11} style={{ color: "#f5cba7" }} />
                                            }
                                        </div>
                                    </th>
                                ))}
                                {renderActions && (
                                    <th className="px-3 py-2.5 text-left font-semibold" style={{ color: "#a8c4d8" }}>
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((row, index) => (
                                <tr
                                    key={
                                        row.email          ??
                                        row.purchase_id    ??
                                        row.assignment_id  ??
                                        row.log_id         ??
                                        row.request_id     ??
                                        row.vendor_id      ??
                                        row.category_id    ??
                                        row.asset_id       ??
                                        index
                                    }
                                    style={{ borderBottom: "1px solid #f1f5f9" }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <td className="px-3 py-2" style={{ color: "#94a3b8" }}>
                                        {firstRow + index + 1}
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className="px-3 py-2" style={{ color: "#1e293b" }}>
                                            {/* Status badge */}
                                            {col.key === "status" ? (
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor:
                                                            row[col.key] === "active"   || row[col.key] === "Active"   || row[col.key] === "available"
                                                                ? "rgba(25,64,94,0.1)"
                                                            : row[col.key] === "assigned"
                                                                ? "rgba(245,203,167,0.4)"
                                                            : row[col.key] === "maintenance"
                                                                ? "rgba(230,126,34,0.15)"
                                                                : "rgba(148,163,184,0.2)",
                                                        color:
                                                            row[col.key] === "active"   || row[col.key] === "Active"   || row[col.key] === "available"
                                                                ? "#19405e"
                                                            : row[col.key] === "assigned"
                                                                ? "#7a4a1e"
                                                            : row[col.key] === "maintenance"
                                                                ? "#9a4a10"
                                                                : "#64748b"
                                                    }}
                                                >
                                                    {row[col.key]}
                                                </span>
                                            ) : (
                                                row[col.key] ?? "—"
                                            )}
                                        </td>
                                    ))}

                                    {renderActions && (
                                        <td className="px-3 py-2">
                                            {renderActions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            )}

            {/* Pagination */}
            {data.length > 0 && (
                <div
                    className="px-4 py-2 border-t"
                    style={{ borderColor: "#f1f5f9" }}
                >
                    <Pagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalRecords={sortedData.length}
                        onPageChange={setCurrentPage}
                        onRowsPerPageChange={(rows) => {
                            setRowsPerPage(rows);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

        </div>

    );

}

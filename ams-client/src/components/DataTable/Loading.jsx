export default function Loading({ rows = 8, columns = 5 }) {

    return (

        <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
        >
            <table className="min-w-full">
                <thead>
                    <tr style={{ backgroundColor: "#19405e" }}>
                        {Array(columns).fill(0).map((_, i) => (
                            <th key={i} className="px-3 py-2.5">
                                <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: "#2d5f87" }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array(rows).fill(0).map((_, r) => (
                        <tr key={r} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            {Array(columns).fill(0).map((_, c) => (
                                <td key={c} className="px-3 py-2.5">
                                    <div
                                        className="h-3 rounded animate-pulse"
                                        style={{
                                            backgroundColor: "#f1f5f9",
                                            width: `${60 + Math.random() * 40}%`
                                        }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );

}

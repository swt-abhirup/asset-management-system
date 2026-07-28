import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeModal from "../components/EmployeeModal";
import DataTable from "../components/DataTable/DataTable";
import SearchBar from "../components/DataTable/SearchBar";
import api from "../services/api";
import { toast } from "../components/Toast";
import { confirm } from "../components/ConfirmDialog";

export default function Employees() {

    const [employees,        setEmployees]        = useState([]);
    const [search,           setSearch]           = useState("");
    const [editingEmployee,  setEditingEmployee]  = useState(null);
    const [showModal,        setShowModal]        = useState(false);
    const [showForm,         setShowForm]         = useState(false);
    const [loading,          setLoading]          = useState(false);

    useEffect(() => { loadEmployees(); }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/employees");
            setEmployees(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load employees.");
        } finally {
            setLoading(false);
        }
    };

    const deleteEmployee = async (email) => {
        const ok = await confirm({ title: "Delete Employee?", message: "This will permanently remove the employee record.", confirmLabel: "Delete", danger: true });
        if (!ok) return;
        try {
            await api.delete(`/api/employees/${email}`);
            toast.success("Employee deleted.");
            loadEmployees();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete employee.");
        }
    };

    const filtered = employees.filter(emp =>
        [emp.fullname, emp.email, emp.role, emp.department]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        { key: "fullname",   label: "Full Name"   },
        { key: "email",      label: "Email"        },
        { key: "role",       label: "Role"         },
        { key: "department", label: "Department"   },
        { key: "status",     label: "Status"       },
    ];

    return (

        <MainLayout>

            {/* ── Header row ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

                <div>
                    <h2
                        className="text-base font-bold leading-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}
                    >
                        Employees
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                        {employees.length} staff member{employees.length !== 1 ? "s" : ""} registered
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchBar
                        value={search}
                        placeholder="Search employees…"
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: "#19405e" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1b4f72"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#19405e"}
                    >
                        <UserPlus size={14} />
                        Add Employee
                    </button>
                </div>

            </div>

            {/* ── Add form (collapsible) ──────────────────────── */}
            {showForm && (
                <div className="mb-4">
                    <EmployeeForm
                        refreshEmployees={() => { loadEmployees(); setShowForm(false); }}
                    />
                </div>
            )}

            {/* ── Table ──────────────────────────────────────── */}
            <DataTable
                columns={columns}
                data={filtered}
                loading={loading}
                renderActions={(emp) => (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => { setEditingEmployee(emp); setShowModal(true); }}
                            className="p-1.5 rounded hover:bg-blue-50"
                            style={{ color: "#1b4f72" }}
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={() => deleteEmployee(emp.email)}
                            className="p-1.5 rounded hover:bg-red-50"
                            style={{ color: "#dc2626" }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            />

            {/* ── Edit modal ─────────────────────────────────── */}
            {showModal && (
                <EmployeeModal
                    employee={editingEmployee}
                    refreshEmployees={loadEmployees}
                    onClose={() => { setShowModal(false); setEditingEmployee(null); }}
                />
            )}

        </MainLayout>

    );

}

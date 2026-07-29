import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, Briefcase, Building2,
    Lock, Eye, EyeOff, Monitor, Shield,
    CalendarDays, Pencil, Save, X, Trash2,
    ClipboardList, CheckCircle2, AlertTriangle
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import api        from "../services/api";
import { toast }  from "../components/Toast";
import { confirm } from "../components/ConfirmDialog";

// ── Shared input style helpers ───────────────────────────────────
const IS = {
    width: "100%", padding: "7px 10px", fontSize: "12px",
    border: "1px solid #e2e8f0", borderRadius: "6px",
    outline: "none", color: "#1e293b", backgroundColor: "#fff"
};
const IS_DISABLED = { ...IS, backgroundColor: "#f8fafc", color: "#94a3b8" };
const L = { color: "#1b4f72", fontSize: "11px", fontWeight: 600, marginBottom: "4px", display: "block" };
const fi = e => { e.target.style.borderColor = "#19405e"; e.target.style.boxShadow = "0 0 0 2px rgba(25,64,94,0.1)"; };
const fo = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

// ── Avatar with initials ─────────────────────────────────────────
function Avatar({ name, size = 56 }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : "U";
    return (
        <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{
                width: size, height: size,
                backgroundColor: "#19405e",
                color: "#f5cba7",
                fontSize: size * 0.33,
                fontFamily: "'Bricolage Grotesque', sans-serif"
            }}>
            {initials}
        </div>
    );
}

// ── Section card wrapper ─────────────────────────────────────────
function Card({ children, className = "" }) {
    return (
        <div className={`rounded-lg px-5 py-4 ${className}`}
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {children}
        </div>
    );
}

// ── Section heading ──────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, action }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: "rgba(25,64,94,0.08)" }}>
                    <Icon size={13} style={{ color: "#19405e" }} />
                </div>
                <h3 className="text-sm font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                    {title}
                </h3>
            </div>
            {action}
        </div>
    );
}

// ── Assigned asset row ───────────────────────────────────────────
function AssetRow({ asset }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b last:border-0"
            style={{ borderColor: "#f1f5f9" }}>
            <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(25,64,94,0.07)" }}>
                <Monitor size={14} style={{ color: "#19405e" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#19405e" }}>
                    {asset.asset_name}
                </p>
                <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
                    {[asset.brand, asset.model].filter(Boolean).join(" · ")}
                    {asset.serial_number ? ` · ${asset.serial_number}` : ""}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <span className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ backgroundColor: "rgba(245,203,167,0.3)", color: "#7a4a1e" }}>
                    Assigned
                </span>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {asset.assigned_date
                        ? new Date(asset.assigned_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                </p>
            </div>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Profile() {

    const navigate = useNavigate();

    const [profile,  setProfile]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [editing,  setEditing]  = useState(false);
    const [saving,   setSaving]   = useState(false);

    // Editable form state
    const [form, setForm] = useState({ fullname: "", phone: "", designation: "", department: "" });

    // Password form
    const [pwForm,   setPwForm]   = useState({ current_password: "", new_password: "", confirm: "" });
    const [showPw,   setShowPw]   = useState({ current: false, new: false, confirm: false });
    const [pwSaving, setPwSaving] = useState(false);

    // ── Load profile ─────────────────────────────────────────
    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/profile");
            setProfile(res.data.data);
            setForm({
                fullname:    res.data.data.fullname    ?? "",
                phone:       res.data.data.phone       ?? "",
                designation: res.data.data.designation ?? "",
                department:  res.data.data.department  ?? "",
            });
        } catch {
            toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    // ── Save profile ─────────────────────────────────────────
    const saveProfile = async () => {
        if (!form.fullname.trim()) { toast.warn("Full name is required."); return; }
        try {
            setSaving(true);
            const res = await api.put("/api/profile", form);
            // Re-sync localStorage with new token & name
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user",  JSON.stringify(res.data.user));
            setEditing(false);
            loadProfile();
            setTimeout(() => toast.success("Profile updated successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setForm({
            fullname:    profile?.fullname    ?? "",
            phone:       profile?.phone       ?? "",
            designation: profile?.designation ?? "",
            department:  profile?.department  ?? "",
        });
    };

    // ── Change password ──────────────────────────────────────
    const changePassword = async () => {
        if (!pwForm.current_password || !pwForm.new_password) {
            toast.warn("All password fields are required.");
            return;
        }
        if (pwForm.new_password.length < 8) {
            toast.warn("New password must be at least 8 characters.");
            return;
        }
        if (pwForm.new_password !== pwForm.confirm) {
            toast.warn("New passwords do not match.");
            return;
        }
        try {
            setPwSaving(true);
            await api.put("/api/profile/password", {
                current_password: pwForm.current_password,
                new_password:     pwForm.new_password,
            });
            setPwForm({ current_password: "", new_password: "", confirm: "" });
            setTimeout(() => toast.success("Password changed successfully."), 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Password change failed.");
        } finally {
            setPwSaving(false);
        }
    };

    // ── Deactivate account ───────────────────────────────────
    const deactivateAccount = async () => {
        const ok = await confirm({ title: "Deactivate Account?", message: "You will be signed out immediately. An admin can reactivate your account later.", confirmLabel: "Deactivate", danger: true });
        if (!ok) return;
        try {
            await api.delete("/api/profile");
            toast.success("Account deactivated.");
            localStorage.clear();
            setTimeout(() => navigate("/"), 800);
        } catch (err) {
            toast.error(err.response?.data?.message || "Deactivation failed.");
        }
    };

    // ── Loading skeleton ─────────────────────────────────────
    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    {[120, 180, 160].map((h, i) => (
                        <div key={i} className="rounded-lg animate-pulse"
                            style={{ height: h, backgroundColor: "#fff", border: "1px solid #e2e8f0" }} />
                    ))}
                </div>
            </MainLayout>
        );
    }

    const joinDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
        : "—";

    // Password strength indicator
    const pwStrength = (() => {
        const p = pwForm.new_password;
        if (!p) return null;
        let score = 0;
        if (p.length >= 8)  score++;
        if (p.length >= 12) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        if (score <= 1) return { label: "Weak",   color: "#dc2626", bars: 1 };
        if (score <= 3) return { label: "Medium", color: "#d97706", bars: 3 };
        return               { label: "Strong",  color: "#19405e", bars: 5 };
    })();

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto flex flex-col gap-4">

                {/* ── Hero header ───────────────────────────── */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Avatar name={profile?.fullname} size={56} />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold leading-tight"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}>
                                {profile?.fullname}
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                                {profile?.designation || profile?.role}
                                {profile?.department ? ` · ${profile.department}` : ""}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                                {profile?.email}
                            </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-xs px-2.5 py-1 rounded font-semibold capitalize"
                                style={{
                                    backgroundColor: "rgba(245,203,167,0.25)",
                                    color: "#19405e",
                                    border: "1px solid rgba(245,203,167,0.5)"
                                }}>
                                {profile?.role}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded font-semibold capitalize"
                                style={{
                                    backgroundColor: profile?.status === "active" ? "rgba(25,64,94,0.08)" : "#f8fafc",
                                    color:           profile?.status === "active" ? "#19405e" : "#94a3b8",
                                }}>
                                {profile?.status}
                            </span>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 pt-4 border-t" style={{ borderColor: "#f1f5f9" }}>
                        {[
                            { icon: Mail,         label: profile?.email                      },
                            { icon: Phone,        label: profile?.phone       || "No phone"  },
                            { icon: Briefcase,    label: profile?.designation || "No designation" },
                            { icon: Building2,    label: profile?.department  || "No department"  },
                            { icon: CalendarDays, label: `Joined ${joinDate}`                },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <Icon size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                                <span className="text-xs" style={{ color: "#64748b" }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ── Two-column: edit profile + assigned assets ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Edit profile */}
                    <Card>
                        <SectionHeading icon={User} title="Personal Information"
                            action={!editing ? (
                                <button onClick={() => setEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold"
                                    style={{ backgroundColor: "rgba(25,64,94,0.08)", color: "#19405e" }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(25,64,94,0.15)"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(25,64,94,0.08)"}>
                                    <Pencil size={12} /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-1.5">
                                    <button onClick={cancelEdit}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border"
                                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                        <X size={12} /> Cancel
                                    </button>
                                    <button onClick={saveProfile} disabled={saving}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-white disabled:opacity-60"
                                        style={{ backgroundColor: "#19405e" }}
                                        onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                                        onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                                        <Save size={12} /> {saving ? "Saving…" : "Save"}
                                    </button>
                                </div>
                            )}
                        />

                        <div className="flex flex-col gap-3">
                            {/* Email — always read-only */}
                            <div>
                                <label style={L}>Email (cannot be changed)</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded"
                                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                    <Mail size={13} style={{ color: "#94a3b8" }} />
                                    <span className="text-xs" style={{ color: "#94a3b8" }}>{profile?.email}</span>
                                </div>
                            </div>

                            <div>
                                <label style={L}>Full Name *</label>
                                <input value={form.fullname}
                                    onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                                    disabled={!editing}
                                    style={editing ? IS : IS_DISABLED}
                                    onFocus={fi} onBlur={fo} />
                            </div>

                            <div>
                                <label style={L}>Phone</label>
                                <input value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    disabled={!editing}
                                    placeholder="+91 98765 43210"
                                    style={editing ? IS : IS_DISABLED}
                                    onFocus={fi} onBlur={fo} />
                            </div>

                            <div>
                                <label style={L}>Designation</label>
                                <input value={form.designation}
                                    onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                                    disabled={!editing}
                                    placeholder="e.g. Senior Developer"
                                    style={editing ? IS : IS_DISABLED}
                                    onFocus={fi} onBlur={fo} />
                            </div>

                            <div>
                                <label style={L}>Department</label>
                                <input value={form.department}
                                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                    disabled={!editing}
                                    placeholder="e.g. Engineering"
                                    style={editing ? IS : IS_DISABLED}
                                    onFocus={fi} onBlur={fo} />
                            </div>

                            {/* Role — read-only, always */}
                            <div>
                                <label style={L}>Role (managed by admin)</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded capitalize"
                                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12px", color: "#94a3b8" }}>
                                    <Shield size={13} style={{ color: "#94a3b8" }} />
                                    {profile?.role}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Assigned assets */}
                    <Card>
                        <SectionHeading icon={ClipboardList} title="Assigned Assets" />

                        {profile?.assigned_assets?.length > 0 ? (
                            <div>
                                {profile.assigned_assets.map(a => (
                                    <AssetRow key={a.assignment_id} asset={a} />
                                ))}
                                <p className="text-xs mt-3 text-center" style={{ color: "#94a3b8" }}>
                                    {profile.assigned_assets.length} asset{profile.assigned_assets.length !== 1 ? "s" : ""} currently assigned to you
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                                    style={{ backgroundColor: "rgba(25,64,94,0.07)" }}>
                                    <Monitor size={18} style={{ color: "#19405e" }} />
                                </div>
                                <p className="text-xs font-semibold" style={{ color: "#19405e" }}>No assets assigned</p>
                                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                                    Contact your IT admin to request an asset.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── Change password ───────────────────────── */}
                <Card>
                    <SectionHeading icon={Lock} title="Change Password" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        {/* Current password */}
                        <div>
                            <label style={L}>Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPw.current ? "text" : "password"}
                                    value={pwForm.current_password}
                                    onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                                    placeholder="••••••••"
                                    style={{ ...IS, paddingRight: "36px" }}
                                    onFocus={fi} onBlur={fo} />
                                <button type="button"
                                    onClick={() => setShowPw(v => ({ ...v, current: !v.current }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "#94a3b8" }}>
                                    {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* New password */}
                        <div>
                            <label style={L}>New Password</label>
                            <div className="relative">
                                <input
                                    type={showPw.new ? "text" : "password"}
                                    value={pwForm.new_password}
                                    onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                                    placeholder="Min. 8 characters"
                                    style={{ ...IS, paddingRight: "36px" }}
                                    onFocus={fi} onBlur={fo} />
                                <button type="button"
                                    onClick={() => setShowPw(v => ({ ...v, new: !v.new }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "#94a3b8" }}>
                                    {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {pwStrength && (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex gap-0.5 flex-1">
                                        {Array(5).fill(0).map((_, i) => (
                                            <div key={i} className="h-1 flex-1 rounded"
                                                style={{ backgroundColor: i < pwStrength.bars ? pwStrength.color : "#e2e8f0" }} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: pwStrength.color }}>
                                        {pwStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label style={L}>Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPw.confirm ? "text" : "password"}
                                    value={pwForm.confirm}
                                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                    placeholder="Repeat new password"
                                    style={{
                                        ...IS, paddingRight: "36px",
                                        borderColor: pwForm.confirm && pwForm.confirm !== pwForm.new_password ? "#fca5a5" : undefined
                                    }}
                                    onFocus={fi} onBlur={fo} />
                                <button type="button"
                                    onClick={() => setShowPw(v => ({ ...v, confirm: !v.confirm }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "#94a3b8" }}>
                                    {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {pwForm.confirm && pwForm.confirm !== pwForm.new_password && (
                                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Passwords do not match.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-3">
                        <button onClick={changePassword} disabled={pwSaving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white disabled:opacity-60"
                            style={{ backgroundColor: "#19405e" }}
                            onMouseEnter={e => { if (!pwSaving) e.currentTarget.style.backgroundColor = "#1b4f72"; }}
                            onMouseLeave={e => { if (!pwSaving) e.currentTarget.style.backgroundColor = "#19405e"; }}>
                            <Lock size={12} />
                            {pwSaving ? "Updating…" : "Update Password"}
                        </button>
                    </div>
                </Card>

                {/* ── Danger zone ───────────────────────────── */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={14} style={{ color: "#dc2626" }} />
                                <h3 className="text-sm font-bold"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#dc2626" }}>
                                    Danger Zone
                                </h3>
                            </div>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>
                                Deactivating your account will sign you out immediately. An admin can reactivate it later.
                                This does not delete your data.
                            </p>
                        </div>
                        <button onClick={deactivateAccount}
                            className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold border flex-shrink-0"
                            style={{ borderColor: "#fca5a5", color: "#dc2626", whiteSpace: "nowrap" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={12} />
                            Deactivate Account
                        </button>
                    </div>
                </Card>

            </div>
        </MainLayout>
    );
}

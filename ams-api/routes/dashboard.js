const express = require("express");
const router  = express.Router();

const verifyToken = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");
const { ScanCommand }    = require("@aws-sdk/lib-dynamodb");

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {

    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in30  = new Date(today); in30.setDate(today.getDate() + 30);
        const in90  = new Date(today); in90.setDate(today.getDate() + 90);

        // Fetch everything in parallel
        const [
            usersRes, assetsRes, assignmentsRes,
            maintenanceRes, repairRes, vendorsRes, purchasesRes
        ] = await Promise.all([
            client.send(new ScanCommand({ TableName: TABLES.USERS,             Select: "COUNT"          })),
            client.send(new ScanCommand({ TableName: TABLES.ASSETS,            Select: "ALL_ATTRIBUTES" })),
            client.send(new ScanCommand({ TableName: TABLES.ASSET_ASSIGNMENTS, Select: "ALL_ATTRIBUTES" })),
            client.send(new ScanCommand({ TableName: TABLES.MAINTENANCE_LOGS,  Select: "ALL_ATTRIBUTES" })),
            client.send(new ScanCommand({ TableName: TABLES.REPAIR_REQUESTS,    Select: "ALL_ATTRIBUTES" })),
            client.send(new ScanCommand({ TableName: TABLES.VENDORS,            Select: "ALL_ATTRIBUTES" })),
            client.send(new ScanCommand({ TableName: TABLES.PURCHASES,           Select: "ALL_ATTRIBUTES" })),
        ]);

        const assets      = assetsRes.Items      ?? [];
        const assignments = assignmentsRes.Items ?? [];
        const maintenance = maintenanceRes.Items  ?? [];
        const repairs     = repairRes.Items       ?? [];
        const vendors     = vendorsRes.Items      ?? [];
        const purchases   = purchasesRes.Items    ?? [];

        // ── Asset stats ──────────────────────────────────────
        const assetStats = {
            total:       assets.length,
            available:   assets.filter(a => a.status === "available").length,
            assigned:    assets.filter(a => a.status === "assigned").length,
            maintenance: assets.filter(a => a.status === "maintenance").length,
            retired:     assets.filter(a => a.status === "retired").length,
        };

        // ── Warranty stats ───────────────────────────────────
        const warrantyStats = assets.reduce((acc, a) => {
            if (!a.warranty_expiry) { acc.unknown++; return acc; }
            const exp  = new Date(a.warranty_expiry);
            const diff = Math.ceil((exp - today) / 86400000);
            if (diff < 0)       acc.expired++;
            else if (diff <= 30) acc.expiring_soon++;
            else if (diff <= 90) acc.expiring_3m++;
            else                 acc.valid++;
            return acc;
        }, { expired: 0, expiring_soon: 0, expiring_3m: 0, valid: 0, unknown: 0 });

        // ── Maintenance stats ────────────────────────────────
        const maintenanceStats = {
            scheduled:   maintenance.filter(m => m.status === "scheduled").length,
            in_progress: maintenance.filter(m => m.status === "in-progress").length,
            completed:   maintenance.filter(m => m.status === "completed").length,
            total_cost:  maintenance.reduce((s, m) => s + (Number(m.cost) || 0), 0),
        };

        // ── Repair request stats ─────────────────────────────
        const repairStats = {
            open:        repairs.filter(r => r.status === "open").length,
            in_progress: repairs.filter(r => r.status === "in-progress").length,
            resolved:    repairs.filter(r => r.status === "resolved").length,
            critical:    repairs.filter(r => r.priority === "critical" && r.status !== "closed").length,
        };

        // ── Procurement stats ────────────────────────────────
        const procurementStats = {
            total_vendors:  vendors.length,
            active_vendors: vendors.filter(v => v.status === "active").length,
            total_orders:   purchases.length,
            pending_payment:purchases.filter(p => p.payment_status === "pending").length,
            total_spend:    purchases.reduce((s, p) => s + (Number(p.total_amount) || 0), 0),
        };

        // ── Assignment stats ─────────────────────────────────
        const assignmentStats = {
            active:   assignments.filter(a => a.status === "active").length,
            returned: assignments.filter(a => a.status === "returned").length,
        };

        // ── Recent activity (last 5 assignments) ────────────
        const recentAssignments = assignments
            .filter(a => a.status === "active")
            .sort((a, b) => new Date(b.assigned_date) - new Date(a.assigned_date))
            .slice(0, 5);

        // ── Recent open repairs ──────────────────────────────
        const recentRepairs = repairs
            .filter(r => r.status === "open" || r.status === "in-progress")
            .sort((a, b) => {
                const p = { critical: 0, high: 1, medium: 2, low: 3 };
                return (p[a.priority] ?? 2) - (p[b.priority] ?? 2);
            })
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                totalEmployees:   usersRes.Count ?? 0,
                assets:           assetStats,
                warranty:         warrantyStats,
                maintenance:      maintenanceStats,
                repairs:          repairStats,
                procurement:      procurementStats,
                assignments:      assignmentStats,
                recentAssignments,
                recentRepairs,
            }
        });

    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

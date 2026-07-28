const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const verifyToken = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");
const {
    GetCommand, UpdateCommand, ScanCommand, QueryCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/profile  — own profile (from JWT email)
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await client.send(
            new GetCommand({ TableName: TABLES.USERS, Key: { email: req.user.email } })
        );

        if (!result.Item) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { password, ...profile } = result.Item;

        // Fetch active assignments for this user
        const assignments = await client.send(
            new QueryCommand({
                TableName:  TABLES.ASSET_ASSIGNMENTS,
                IndexName:  "employee-index",
                KeyConditionExpression: "employee_email = :email",
                ExpressionAttributeValues: { ":email": req.user.email }
            })
        );

        const activeAssignments = (assignments.Items ?? []).filter(a => a.status === "active");

        // Enrich assignments with asset names
        const enriched = await Promise.all(
            activeAssignments.map(async a => {
                const asset = await client.send(
                    new GetCommand({ TableName: TABLES.ASSETS, Key: { asset_id: a.asset_id } })
                );
                return {
                    assignment_id: a.assignment_id,
                    asset_id:      a.asset_id,
                    asset_name:    asset.Item?.name    ?? "—",
                    brand:         asset.Item?.brand   ?? "—",
                    model:         asset.Item?.model   ?? "—",
                    serial_number: asset.Item?.serial_number ?? "—",
                    category_id:   asset.Item?.category_id  ?? "",
                    assigned_date: a.assigned_date,
                    notes:         a.notes ?? "",
                };
            })
        );

        res.json({
            success: true,
            data: {
                ...profile,
                assigned_assets: enriched
            }
        });

    } catch (err) {
        console.error("Profile GET error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// PUT /api/profile  — update own profile (name, phone, designation, department)
router.put("/", verifyToken, async (req, res) => {
    try {
        const { fullname, phone = "", designation = "", department = "" } = req.body;

        if (!fullname?.trim()) {
            return res.status(400).json({ success: false, message: "Full name is required." });
        }

        await client.send(
            new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { email: req.user.email },
                UpdateExpression:
                    "SET fullname = :fn, phone = :ph, designation = :dsg, department = :dept, updated_at = :ua",
                ExpressionAttributeValues: {
                    ":fn":   fullname.trim(),
                    ":ph":   phone.trim(),
                    ":dsg":  designation.trim(),
                    ":dept": department.trim(),
                    ":ua":   new Date().toISOString(),
                }
            })
        );

        // Re-issue JWT with updated fullname so Navbar stays in sync
        const token = jwt.sign(
            { email: req.user.email, fullname: fullname.trim(), role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            token,
            user: { email: req.user.email, fullname: fullname.trim(), role: req.user.role }
        });

    } catch (err) {
        console.error("Profile PUT error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// PUT /api/profile/password  — change own password
router.put("/password", verifyToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: "current_password and new_password are required."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters."
            });
        }

        // Fetch current hash
        const result = await client.send(
            new GetCommand({ TableName: TABLES.USERS, Key: { email: req.user.email } })
        );

        if (!result.Item) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify current password
        const valid = await bcrypt.compare(current_password, result.Item.password);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const hashed = await bcrypt.hash(new_password, 10);

        await client.send(
            new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { email: req.user.email },
                UpdateExpression: "SET password = :pw, updated_at = :ua",
                ExpressionAttributeValues: {
                    ":pw": hashed,
                    ":ua": new Date().toISOString(),
                }
            })
        );

        res.json({ success: true, message: "Password changed successfully." });

    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// DELETE /api/profile  — deactivate own account (soft delete — sets status inactive)
router.delete("/", verifyToken, async (req, res) => {
    try {
        // Prevent the only admin from deactivating themselves
        const all = await client.send(new ScanCommand({ TableName: TABLES.USERS }));
        const admins = (all.Items ?? []).filter(u => u.role === "admin" && u.status === "active");

        if (admins.length === 1 && admins[0].email === req.user.email) {
            return res.status(403).json({
                success: false,
                message: "Cannot deactivate the only active admin account."
            });
        }

        await client.send(
            new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { email: req.user.email },
                UpdateExpression: "SET #status = :st, updated_at = :ua",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: {
                    ":st": "inactive",
                    ":ua": new Date().toISOString(),
                }
            })
        );

        res.json({ success: true, message: "Account deactivated." });

    } catch (err) {
        console.error("Profile DELETE error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

const verifyToken        = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/repair-requests
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await client.send(new ScanCommand({ TableName: TABLES.REPAIR_REQUESTS }));
        res.json({ success: true, data: result.Items ?? [] });
    } catch (err) {
        console.error("RepairRequests GET error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/repair-requests/:request_id
router.get("/:request_id", verifyToken, async (req, res) => {
    try {
        const result = await client.send(
            new GetCommand({ TableName: TABLES.REPAIR_REQUESTS, Key: { request_id: req.params.request_id } })
        );
        if (!result.Item) return res.status(404).json({ success: false, message: "Request not found" });
        res.json({ success: true, data: result.Item });
    } catch (err) {
        console.error("RepairRequests GET/:id error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/repair-requests
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            asset_id, title, description,
            priority    = "medium",
            reported_by,
        } = req.body;

        if (!asset_id || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "asset_id, title and description are required"
            });
        }

        const item = {
            request_id:  uuidv4(),
            asset_id,
            title,
            description,
            priority,
            reported_by: reported_by || req.user.email,
            assigned_to: null,
            status:      "open",
            resolution:  "",
            created_at:  new Date().toISOString(),
            updated_at:  new Date().toISOString(),
        };

        await client.send(new PutCommand({ TableName: TABLES.REPAIR_REQUESTS, Item: item }));
        res.status(201).json({ success: true, message: "Repair request created", data: item });
    } catch (err) {
        console.error("RepairRequests POST error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/repair-requests/:request_id
router.put("/:request_id", verifyToken, async (req, res) => {
    try {
        const { status, assigned_to, resolution, priority } = req.body;

        await client.send(new UpdateCommand({
            TableName: TABLES.REPAIR_REQUESTS,
            Key: { request_id: req.params.request_id },
            UpdateExpression:
                "SET #status = :status, assigned_to = :at, resolution = :res, priority = :pri, updated_at = :ua",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": status,
                ":at":     assigned_to ?? null,
                ":res":    resolution  ?? "",
                ":pri":    priority    ?? "medium",
                ":ua":     new Date().toISOString(),
            }
        }));
        res.json({ success: true, message: "Request updated" });
    } catch (err) {
        console.error("RepairRequests PUT error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/repair-requests/:request_id
router.delete("/:request_id", verifyToken, async (req, res) => {
    try {
        await client.send(
            new DeleteCommand({ TableName: TABLES.REPAIR_REQUESTS, Key: { request_id: req.params.request_id } })
        );
        res.json({ success: true, message: "Request deleted" });
    } catch (err) {
        console.error("RepairRequests DELETE error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

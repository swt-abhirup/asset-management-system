const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const verifyToken = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand,
    PutCommand,
    UpdateCommand,
    GetCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/maintenance  — all maintenance logs
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new ScanCommand({ TableName: TABLES.MAINTENANCE_LOGS })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// GET /api/maintenance/asset/:asset_id  — maintenance history for an asset
router.get("/asset/:asset_id", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new QueryCommand({
                TableName: TABLES.MAINTENANCE_LOGS,
                IndexName: "asset-maintenance-index",
                KeyConditionExpression: "asset_id = :aid",
                ExpressionAttributeValues: { ":aid": req.params.asset_id }
            })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// POST /api/maintenance  — log a maintenance event
router.post("/", verifyToken, async (req, res) => {

    try {

        const {
            asset_id,
            type,            // repair | service | inspection | upgrade
            description,
            cost = 0,
            vendor = "",
            scheduled_date,
            completed_date = null,
            status = "scheduled"  // scheduled | in-progress | completed
        } = req.body;

        if (!asset_id || !type || !description) {
            return res.status(400).json({
                success: false,
                message: "asset_id, type and description are required"
            });
        }

        // Flip asset status to maintenance if sending to repair
        if (status === "in-progress") {
            await client.send(
                new UpdateCommand({
                    TableName: TABLES.ASSETS,
                    Key: { asset_id },
                    UpdateExpression: "SET #status = :status",
                    ExpressionAttributeNames: { "#status": "status" },
                    ExpressionAttributeValues: { ":status": "maintenance" }
                })
            );
        }

        const log = {
            log_id:         uuidv4(),
            asset_id,
            type,
            description,
            cost,
            vendor,
            scheduled_date: scheduled_date ?? new Date().toISOString(),
            completed_date,
            status,
            logged_by:      req.user.email,
            created_at:     new Date().toISOString()
        };

        await client.send(
            new PutCommand({ TableName: TABLES.MAINTENANCE_LOGS, Item: log })
        );

        res.status(201).json({ success: true, message: "Maintenance log created", data: log });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// PUT /api/maintenance/:log_id  — update maintenance log
router.put("/:log_id", verifyToken, async (req, res) => {

    try {

        const { status, completed_date, cost, notes = "" } = req.body;
        const { log_id } = req.params;

        // Get current log to find asset_id
        const logResult = await client.send(
            new GetCommand({ TableName: TABLES.MAINTENANCE_LOGS, Key: { log_id } })
        );

        if (!logResult.Item) {
            return res.status(404).json({ success: false, message: "Log not found" });
        }

        const updates = [
            client.send(new UpdateCommand({
                TableName: TABLES.MAINTENANCE_LOGS,
                Key: { log_id },
                UpdateExpression:
                    "SET #status = :status, completed_date = :cd, cost = :cost, notes = :notes",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: {
                    ":status": status,
                    ":cd":     completed_date ?? null,
                    ":cost":   cost ?? logResult.Item.cost,
                    ":notes":  notes
                }
            }))
        ];

        // If completed, flip asset back to available ONLY if it is still in 'maintenance'
        // (guards against the asset having been reassigned before log was closed)
        if (status === "completed") {
            const assetResult = await client.send(
                new GetCommand({ TableName: TABLES.ASSETS, Key: { asset_id: logResult.Item.asset_id } })
            );
            if (assetResult.Item?.status === "maintenance") {
                updates.push(
                    client.send(new UpdateCommand({
                        TableName: TABLES.ASSETS,
                        Key: { asset_id: logResult.Item.asset_id },
                        UpdateExpression: "SET #status = :status",
                        ExpressionAttributeNames: { "#status": "status" },
                        ExpressionAttributeValues: { ":status": "available" }
                    }))
                );
            }
        }

        await Promise.all(updates);

        res.json({ success: true, message: "Maintenance log updated" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

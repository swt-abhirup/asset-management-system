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


// GET /api/assignments  — all assignments
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new ScanCommand({ TableName: TABLES.ASSET_ASSIGNMENTS })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// GET /api/assignments/employee/:email  — all assets held by an employee
router.get("/employee/:email", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new QueryCommand({
                TableName: TABLES.ASSET_ASSIGNMENTS,
                IndexName: "employee-index",
                KeyConditionExpression: "employee_email = :email",
                ExpressionAttributeValues: { ":email": req.params.email }
            })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// GET /api/assignments/asset/:asset_id  — assignment history for an asset
router.get("/asset/:asset_id", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new QueryCommand({
                TableName: TABLES.ASSET_ASSIGNMENTS,
                IndexName: "asset-index",
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


// POST /api/assignments  — assign asset to employee
router.post("/", verifyToken, async (req, res) => {

    try {

        const { asset_id, employee_email, notes = "" } = req.body;

        if (!asset_id || !employee_email) {
            return res.status(400).json({
                success: false,
                message: "asset_id and employee_email are required"
            });
        }

        // Check asset exists and is available
        const assetResult = await client.send(
            new GetCommand({ TableName: TABLES.ASSETS, Key: { asset_id } })
        );

        if (!assetResult.Item) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

        if (assetResult.Item.status !== "available") {
            return res.status(409).json({
                success: false,
                message: `Asset is currently '${assetResult.Item.status}' and cannot be assigned`
            });
        }

        const assignment = {
            assignment_id:   uuidv4(),
            asset_id,
            employee_email,
            assigned_by:     req.user.email,
            assigned_date:   new Date().toISOString(),
            return_date:     null,
            status:          "active",    // active | returned
            notes
        };

        // Save assignment and flip asset status to 'assigned' atomically
        await Promise.all([
            client.send(new PutCommand({ TableName: TABLES.ASSET_ASSIGNMENTS, Item: assignment })),
            client.send(new UpdateCommand({
                TableName: TABLES.ASSETS,
                Key: { asset_id },
                UpdateExpression: "SET #status = :status, assigned_to = :email",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":status": "assigned", ":email": employee_email }
            }))
        ]);

        res.status(201).json({ success: true, message: "Asset assigned", data: assignment });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// PUT /api/assignments/:assignment_id/return  — return asset
router.put("/:assignment_id/return", verifyToken, async (req, res) => {

    try {

        const { assignment_id } = req.params;
        const { notes = "" } = req.body;

        const result = await client.send(
            new GetCommand({ TableName: TABLES.ASSET_ASSIGNMENTS, Key: { assignment_id } })
        );

        if (!result.Item) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        if (result.Item.status === "returned") {
            return res.status(409).json({ success: false, message: "Assignment has already been returned" });
        }

        const { asset_id } = result.Item;
        const returnDate = new Date().toISOString();

        await Promise.all([
            client.send(new UpdateCommand({
                TableName: TABLES.ASSET_ASSIGNMENTS,
                Key: { assignment_id },
                UpdateExpression: "SET #status = :status, return_date = :rd, return_notes = :notes",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":status": "returned", ":rd": returnDate, ":notes": notes }
            })),
            client.send(new UpdateCommand({
                TableName: TABLES.ASSETS,
                Key: { asset_id },
                UpdateExpression: "SET #status = :status REMOVE assigned_to",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":status": "available" }
            }))
        ]);

        res.json({ success: true, message: "Asset returned successfully" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

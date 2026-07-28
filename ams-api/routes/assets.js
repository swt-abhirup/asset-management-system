const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const verifyToken = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/assets  — list all assets
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new ScanCommand({ TableName: TABLES.ASSETS })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// GET /api/assets/:asset_id  — single asset
router.get("/:asset_id", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new GetCommand({
                TableName: TABLES.ASSETS,
                Key: { asset_id: req.params.asset_id }
            })
        );

        if (!result.Item) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

        res.json({ success: true, data: result.Item });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// POST /api/assets  — add new asset
router.post("/", verifyToken, async (req, res) => {

    try {

        const {
            name,
            category_id,
            brand,
            model,
            serial_number,
            purchase_date,
            purchase_cost,
            warranty_expiry,
            notes = ""
        } = req.body;

        if (!name || !category_id) {
            return res.status(400).json({
                success: false,
                message: "name and category_id are required"
            });
        }

        const asset = {
            asset_id:       uuidv4(),
            name,
            category_id,
            brand:          brand ?? "",
            model:          model ?? "",
            serial_number:  serial_number ?? "",
            purchase_date:  purchase_date ?? "",
            purchase_cost:  purchase_cost ?? 0,
            warranty_expiry: warranty_expiry ?? "",
            status:         "available",   // available | assigned | maintenance | retired
            notes,
            created_at:     new Date().toISOString()
        };

        await client.send(
            new PutCommand({ TableName: TABLES.ASSETS, Item: asset })
        );

        res.status(201).json({ success: true, message: "Asset created", data: asset });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// PUT /api/assets/:asset_id  — update asset
router.put("/:asset_id", verifyToken, async (req, res) => {

    try {

        const {
            name, brand, model, serial_number,
            purchase_date, purchase_cost,
            warranty_expiry, status, notes
        } = req.body;

        await client.send(
            new UpdateCommand({
                TableName: TABLES.ASSETS,
                Key: { asset_id: req.params.asset_id },
                UpdateExpression:
                    "SET #name = :name, brand = :brand, model = :model, " +
                    "serial_number = :sn, purchase_date = :pd, purchase_cost = :pc, " +
                    "warranty_expiry = :we, #status = :status, notes = :notes, " +
                    "updated_at = :ua",
                ExpressionAttributeNames: {
                    "#name":   "name",
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":name":   name,
                    ":brand":  brand ?? "",
                    ":model":  model ?? "",
                    ":sn":     serial_number ?? "",
                    ":pd":     purchase_date ?? "",
                    ":pc":     purchase_cost ?? 0,
                    ":we":     warranty_expiry ?? "",
                    ":status": status,
                    ":notes":  notes ?? "",
                    ":ua":     new Date().toISOString()
                }
            })
        );

        res.json({ success: true, message: "Asset updated" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// DELETE /api/assets/:asset_id
router.delete("/:asset_id", verifyToken, async (req, res) => {

    try {

        await client.send(
            new DeleteCommand({
                TableName: TABLES.ASSETS,
                Key: { asset_id: req.params.asset_id }
            })
        );

        res.json({ success: true, message: "Asset deleted" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

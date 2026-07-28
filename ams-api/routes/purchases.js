const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

const verifyToken        = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand, QueryCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/purchases
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await client.send(new ScanCommand({ TableName: TABLES.PURCHASES }));
        res.json({ success: true, data: result.Items ?? [] });
    } catch (err) {
        console.error("Purchases GET error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/purchases/vendor/:vendor_id
router.get("/vendor/:vendor_id", verifyToken, async (req, res) => {
    try {
        const result = await client.send(new QueryCommand({
            TableName:                 TABLES.PURCHASES,
            IndexName:                 "vendor-index",
            KeyConditionExpression:    "vendor_id = :vid",
            ExpressionAttributeValues: { ":vid": req.params.vendor_id }
        }));
        res.json({ success: true, data: result.Items ?? [] });
    } catch (err) {
        console.error("Purchases GET/vendor error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/purchases
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            vendor_id,
            po_number      = "",
            items          = [],
            total_amount   = 0,
            purchase_date,
            delivery_date  = null,
            invoice_number = "",
            payment_status = "pending",
            payment_date   = null,
            notes          = "",
        } = req.body;

        if (!vendor_id || !purchase_date) {
            return res.status(400).json({
                success: false,
                message: "vendor_id and purchase_date are required"
            });
        }

        const item = {
            purchase_id:    uuidv4(),
            vendor_id,
            po_number,
            items,
            total_amount:   Number(total_amount),
            purchase_date,
            delivery_date,
            invoice_number,
            payment_status,
            payment_date,
            notes,
            created_by:  req.user.email,
            created_at:  new Date().toISOString(),
            updated_at:  new Date().toISOString(),
        };

        await client.send(new PutCommand({ TableName: TABLES.PURCHASES, Item: item }));
        res.status(201).json({ success: true, message: "Purchase created", data: item });
    } catch (err) {
        console.error("Purchases POST error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/purchases/:purchase_id
router.put("/:purchase_id", verifyToken, async (req, res) => {
    try {
        const {
            po_number, invoice_number, delivery_date,
            payment_status, payment_date, notes, items, total_amount
        } = req.body;

        await client.send(new UpdateCommand({
            TableName: TABLES.PURCHASES,
            Key: { purchase_id: req.params.purchase_id },
            UpdateExpression:
                "SET po_number = :po, invoice_number = :inv, delivery_date = :dd, " +
                "payment_status = :ps, payment_date = :pd, notes = :nt, " +
                "items = :it, total_amount = :ta, updated_at = :ua",
            ExpressionAttributeValues: {
                ":po":  po_number      ?? "",
                ":inv": invoice_number ?? "",
                ":dd":  delivery_date  ?? null,
                ":ps":  payment_status ?? "pending",
                ":pd":  payment_date   ?? null,
                ":nt":  notes          ?? "",
                ":it":  items          ?? [],
                ":ta":  Number(total_amount) || 0,
                ":ua":  new Date().toISOString(),
            }
        }));
        res.json({ success: true, message: "Purchase updated" });
    } catch (err) {
        console.error("Purchases PUT error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/purchases/:purchase_id
router.delete("/:purchase_id", verifyToken, async (req, res) => {
    try {
        await client.send(
            new DeleteCommand({ TableName: TABLES.PURCHASES, Key: { purchase_id: req.params.purchase_id } })
        );
        res.json({ success: true, message: "Purchase deleted" });
    } catch (err) {
        console.error("Purchases DELETE error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");

const verifyToken        = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/vendors
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await client.send(new ScanCommand({ TableName: TABLES.VENDORS }));
        res.json({ success: true, data: result.Items ?? [] });
    } catch (err) {
        console.error("Vendors GET error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/vendors/:vendor_id
router.get("/:vendor_id", verifyToken, async (req, res) => {
    try {
        const result = await client.send(
            new GetCommand({ TableName: TABLES.VENDORS, Key: { vendor_id: req.params.vendor_id } })
        );
        if (!result.Item) return res.status(404).json({ success: false, message: "Vendor not found" });
        res.json({ success: true, data: result.Item });
    } catch (err) {
        console.error("Vendors GET/:id error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/vendors
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            name, contact_person = "", email = "", phone = "",
            address = "", website = "", category = "", notes = ""
        } = req.body;

        if (!name) return res.status(400).json({ success: false, message: "Vendor name is required" });

        const item = {
            vendor_id:      uuidv4(),
            name,
            contact_person,
            email,
            phone,
            address,
            website,
            category,
            notes,
            status:     "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        await client.send(new PutCommand({ TableName: TABLES.VENDORS, Item: item }));
        res.status(201).json({ success: true, message: "Vendor created", data: item });
    } catch (err) {
        console.error("Vendors POST error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/vendors/:vendor_id
router.put("/:vendor_id", verifyToken, async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, website, category, notes, status } = req.body;

        await client.send(new UpdateCommand({
            TableName: TABLES.VENDORS,
            Key: { vendor_id: req.params.vendor_id },
            UpdateExpression:
                "SET #name = :n, contact_person = :cp, email = :em, phone = :ph, " +
                "address = :ad, website = :wb, category = :cat, notes = :nt, " +
                "#status = :st, updated_at = :ua",
            ExpressionAttributeNames: { "#name": "name", "#status": "status" },
            ExpressionAttributeValues: {
                ":n":  name,            ":cp": contact_person ?? "",
                ":em": email ?? "",     ":ph": phone ?? "",
                ":ad": address ?? "",   ":wb": website ?? "",
                ":cat":category ?? "",  ":nt": notes ?? "",
                ":st": status ?? "active",
                ":ua": new Date().toISOString(),
            }
        }));
        res.json({ success: true, message: "Vendor updated" });
    } catch (err) {
        console.error("Vendors PUT error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/vendors/:vendor_id
router.delete("/:vendor_id", verifyToken, async (req, res) => {
    try {
        await client.send(
            new DeleteCommand({ TableName: TABLES.VENDORS, Key: { vendor_id: req.params.vendor_id } })
        );
        res.json({ success: true, message: "Vendor deleted" });
    } catch (err) {
        console.error("Vendors DELETE error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

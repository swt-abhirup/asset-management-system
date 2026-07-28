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


// GET /api/categories
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new ScanCommand({ TableName: TABLES.ASSET_CATEGORIES })
        );

        res.json({ success: true, data: result.Items ?? [] });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// POST /api/categories
router.post("/", verifyToken, async (req, res) => {

    try {

        const { name, description = "" } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "name is required" });
        }

        const category = {
            category_id: uuidv4(),
            name,
            description,
            created_at: new Date().toISOString()
        };

        await client.send(
            new PutCommand({ TableName: TABLES.ASSET_CATEGORIES, Item: category })
        );

        res.status(201).json({ success: true, message: "Category created", data: category });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// PUT /api/categories/:category_id
router.put("/:category_id", verifyToken, async (req, res) => {

    try {

        const { name, description } = req.body;

        await client.send(
            new UpdateCommand({
                TableName: TABLES.ASSET_CATEGORIES,
                Key: { category_id: req.params.category_id },
                UpdateExpression: "SET #name = :name, description = :desc",
                ExpressionAttributeNames: { "#name": "name" },
                ExpressionAttributeValues: {
                    ":name": name,
                    ":desc": description ?? ""
                }
            })
        );

        res.json({ success: true, message: "Category updated" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// DELETE /api/categories/:category_id
router.delete("/:category_id", verifyToken, async (req, res) => {

    try {

        await client.send(
            new DeleteCommand({
                TableName: TABLES.ASSET_CATEGORIES,
                Key: { category_id: req.params.category_id }
            })
        );

        res.json({ success: true, message: "Category deleted" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

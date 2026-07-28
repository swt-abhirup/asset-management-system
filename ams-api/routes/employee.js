const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const { client, TABLES } = require("../config/dynamodb");

const {
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand
} = require("@aws-sdk/lib-dynamodb");


// GET /api/employees  — list all employees
router.get("/", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new ScanCommand({ TableName: TABLES.USERS })
        );

        // Strip passwords before sending
        const employees = result.Items.map(({ password, ...rest }) => rest);

        res.json({ success: true, data: employees });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// GET /api/employees/:email  — single employee
router.get("/:email", verifyToken, async (req, res) => {

    try {

        const result = await client.send(
            new GetCommand({
                TableName: TABLES.USERS,
                Key: { email: req.params.email }
            })
        );

        if (!result.Item) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const { password, ...employee } = result.Item;
        res.json({ success: true, data: employee });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// POST /api/employees  — add employee
router.post("/", verifyToken, async (req, res) => {

    try {

        const { fullname, email, role = "employee", status = "active", department = "" } = req.body;

        if (!fullname || !email) {
            return res.status(400).json({ success: false, message: "fullname and email are required" });
        }

        const employee = {
            email,
            fullname,
            role,
            status,
            department,
            created_at: new Date().toISOString()
        };

        await client.send(
            new PutCommand({
                TableName: TABLES.USERS,
                ConditionExpression: "attribute_not_exists(email)",
                Item: employee
            })
        );

        res.status(201).json({ success: true, message: "Employee added", data: employee });

    } catch (err) {

        if (err.name === "ConditionalCheckFailedException") {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// PUT /api/employees/:email  — update employee
router.put("/:email", verifyToken, async (req, res) => {

    try {

        const { fullname, role, status, department } = req.body;
        const email = req.params.email;

        await client.send(
            new UpdateCommand({
                TableName: TABLES.USERS,
                Key: { email },
                UpdateExpression:
                    "SET fullname = :fullname, #role = :role, #status = :status, department = :department",
                ExpressionAttributeNames: {
                    "#role":   "role",
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":fullname":   fullname,
                    ":role":       role,
                    ":status":     status,
                    ":department": department ?? ""
                }
            })
        );

        res.json({ success: true, message: "Employee updated" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// DELETE /api/employees/:email  — remove employee
router.delete("/:email", verifyToken, async (req, res) => {

    try {

        await client.send(
            new DeleteCommand({
                TableName: TABLES.USERS,
                Key: { email: req.params.email }
            })
        );

        res.json({ success: true, message: "Employee deleted" });

    } catch (err) {

        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }

});

module.exports = router;

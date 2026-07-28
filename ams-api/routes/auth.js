const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const { client, TABLES } = require("../config/dynamodb");
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");


// POST /api/auth/register
router.post("/register", async (req, res) => {

    try {

        const { fullname, email, password, role = "employee" } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "fullname, email and password are required"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await client.send(
            new PutCommand({
                TableName: TABLES.USERS,
                ConditionExpression: "attribute_not_exists(email)",
                Item: {
                    email,
                    fullname,
                    password: hashPassword,
                    role,
                    status: "active",
                    created_at: new Date().toISOString()
                }
            })
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {

        if (err.name === "ConditionalCheckFailedException") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error("Register error:", err);
        res.status(500).json({ success: false, message: err.message });
    }

});


// POST /api/auth/login
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required"
            });
        }

        const result = await client.send(
            new GetCommand({
                TableName: TABLES.USERS,
                Key: { email }
            })
        );

        if (!result.Item) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (result.Item.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        const valid = await bcrypt.compare(password, result.Item.password);

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                email:    result.Item.email,
                fullname: result.Item.fullname,
                role:     result.Item.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                email:    result.Item.email,
                fullname: result.Item.fullname,
                role:     result.Item.role
            }
        });

    } catch (err) {

        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }

});

module.exports = router;

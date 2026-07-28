require("dotenv").config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const rawClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    }
});

// Document client gives automatic marshalling/unmarshalling
const client = DynamoDBDocumentClient.from(rawClient);

// Table name constants — all prefixed with ams-
const TABLES = {
    USERS:             "ams-users",
    ASSETS:            "ams-assets",
    ASSET_CATEGORIES:  "ams-asset-categories",
    ASSET_ASSIGNMENTS: "ams-asset-assignments",
    MAINTENANCE_LOGS:  "ams-maintenance-logs",
    REPAIR_REQUESTS:   "ams-repair-requests",
    VENDORS:           "ams-vendors",
    PURCHASES:         "ams-purchases",
};

module.exports = { client, TABLES };
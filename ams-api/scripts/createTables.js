require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    }
});

const tables = [

    // ── Users (auth + staff accounts) ──────────────────────────────────────
    {
        TableName: "ams-users",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "email", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "email", AttributeType: "S" }
        ]
    },

    // ── Asset Categories (Laptop, Monitor, Mouse, etc.) ────────────────────
    {
        TableName: "ams-asset-categories",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "category_id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "category_id", AttributeType: "S" }
        ]
    },

    // ── Assets (each individual IT asset) ─────────────────────────────────
    // Partition key: asset_id  |  GSI on category_id and status
    {
        TableName: "ams-assets",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "asset_id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "asset_id",    AttributeType: "S" },
            { AttributeName: "category_id", AttributeType: "S" },
            { AttributeName: "status",      AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "category-index",
                KeySchema: [
                    { AttributeName: "category_id", KeyType: "HASH" },
                    { AttributeName: "status",       KeyType: "RANGE" }
                ],
                Projection: { ProjectionType: "ALL" }
            }
        ]
    },

    // ── Asset Assignments (who holds which asset) ──────────────────────────
    // Partition key: assignment_id  |  GSI on asset_id and employee_email
    {
        TableName: "ams-asset-assignments",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "assignment_id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "assignment_id",  AttributeType: "S" },
            { AttributeName: "asset_id",       AttributeType: "S" },
            { AttributeName: "employee_email", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "asset-index",
                KeySchema: [
                    { AttributeName: "asset_id", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" }
            },
            {
                IndexName: "employee-index",
                KeySchema: [
                    { AttributeName: "employee_email", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" }
            }
        ]
    },

    // ── Maintenance Logs (repair / service records) ────────────────────────
    // Partition key: log_id  |  GSI on asset_id
    {
        TableName: "ams-maintenance-logs",
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
            { AttributeName: "log_id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
            { AttributeName: "log_id",  AttributeType: "S" },
            { AttributeName: "asset_id", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "asset-maintenance-index",
                KeySchema: [
                    { AttributeName: "asset_id", KeyType: "HASH" }
                ],
                Projection: { ProjectionType: "ALL" }
            }
        ]
    }

];

async function createTables() {

    // Get existing tables to skip already-created ones
    const { TableNames: existing } =
        await client.send(new ListTablesCommand({}));

    console.log("\nExisting tables:", existing);
    console.log("─────────────────────────────────────────");

    for (const tableDef of tables) {

        if (existing.includes(tableDef.TableName)) {
            console.log(`⏭  SKIPPED  ${tableDef.TableName} (already exists)`);
            continue;
        }

        try {
            await client.send(new CreateTableCommand(tableDef));
            console.log(`✅ CREATED  ${tableDef.TableName}`);
        } catch (err) {
            console.error(`❌ FAILED   ${tableDef.TableName} →`, err.message);
        }
    }

    console.log("─────────────────────────────────────────");
    console.log("Done.\n");
}

createTables();

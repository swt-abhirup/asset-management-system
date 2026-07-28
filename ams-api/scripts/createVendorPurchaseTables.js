require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY }
});

const tables = [
    {
        TableName:            "ams-vendors",
        BillingMode:          "PAY_PER_REQUEST",
        KeySchema:            [{ AttributeName: "vendor_id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "vendor_id", AttributeType: "S" }],
    },
    {
        TableName:            "ams-purchases",
        BillingMode:          "PAY_PER_REQUEST",
        KeySchema:            [{ AttributeName: "purchase_id", KeyType: "HASH" }],
        AttributeDefinitions: [
            { AttributeName: "purchase_id", AttributeType: "S" },
            { AttributeName: "vendor_id",   AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [{
            IndexName:  "vendor-index",
            KeySchema:  [{ AttributeName: "vendor_id", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" }
        }]
    }
];

async function run() {
    const { TableNames: existing } = await client.send(new ListTablesCommand({}));
    console.log("\n── Vendor & Purchase Tables ──────────────────");
    for (const t of tables) {
        if (existing.includes(t.TableName)) {
            console.log(`⏭  SKIPPED  ${t.TableName}`);
        } else {
            await client.send(new CreateTableCommand(t));
            console.log(`✅ CREATED  ${t.TableName}`);
        }
    }
    console.log("──────────────────────────────────────────────\n");
}

run().catch(console.error);

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY }
});

async function run() {
    const { TableNames } = await client.send(new ListTablesCommand({}));

    if (TableNames.includes("ams-repair-requests")) {
        console.log("⏭  SKIPPED  ams-repair-requests (already exists)");
        return;
    }

    await client.send(new CreateTableCommand({
        TableName:             "ams-repair-requests",
        BillingMode:           "PAY_PER_REQUEST",
        KeySchema:             [{ AttributeName: "request_id", KeyType: "HASH" }],
        AttributeDefinitions:  [{ AttributeName: "request_id", AttributeType: "S" }],
    }));

    console.log("✅ CREATED  ams-repair-requests");
}

run().catch(console.error);

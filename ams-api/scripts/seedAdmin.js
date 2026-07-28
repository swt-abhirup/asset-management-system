require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const raw = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:     process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    }
});

const client = DynamoDBDocumentClient.from(raw);

const ADMIN = {
    email:    "admin@company.com",
    password: "Admin@123",
    fullname: "System Admin",
    role:     "admin",
    status:   "active"
};

async function seed() {

    // Check if already exists
    const existing = await client.send(
        new GetCommand({ TableName: "ams-users", Key: { email: ADMIN.email } })
    );

    if (existing.Item) {
        console.log("✅ Admin already exists:", ADMIN.email);
        return;
    }

    const hashed = await bcrypt.hash(ADMIN.password, 10);

    await client.send(
        new PutCommand({
            TableName: "ams-users",
            Item: {
                email:      ADMIN.email,
                fullname:   ADMIN.fullname,
                password:   hashed,
                role:       ADMIN.role,
                status:     ADMIN.status,
                created_at: new Date().toISOString()
            }
        })
    );

    console.log("✅ Admin created successfully");
    console.log("   Email   :", ADMIN.email);
    console.log("   Password:", ADMIN.password);
}

seed().catch(console.error);

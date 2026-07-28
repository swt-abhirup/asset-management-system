const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

require("dotenv").config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
  }
});

console.log("Connected");
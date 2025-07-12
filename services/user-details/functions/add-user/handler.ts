import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const addUserDetails = async (event: any) => {
    const body = JSON.parse(event.body || "{}");

    const userId = uuidv4();
    const now = new Date().toISOString();

    const newItem = {
        userId,
        "scrape-info": body["scrape-info"] || {},
        createdDt: now,
        updatedDt: now,
    };

    try {
        await ddb.send(new PutCommand({
            TableName: process.env.USER_DETAILS_TABLE,
            Item: newItem,
        }));

        console.log('User added:', newItem);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User added", userId }),
        };
    } catch (err) {
        console.error("Error adding user:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to add user" }),
        };
    }
}
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);


export const editUserDetails = async (event: any) => {
    const body = JSON.parse(event.body || "{}");
    const userId = event.headers?.userId;
    const { scrapeInfo } = body;

    console.log(`Updating details for userId: ${userId}, new details: ${JSON.stringify(scrapeInfo)}`);

    if (!userId || !scrapeInfo) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId or scrape-info" }),
        };
    }

    try {
        await ddb.send(new UpdateCommand({
            TableName: process.env.USER_DETAILS_TABLE,
            Key: { userId },
            UpdateExpression: "SET #scrapeInfo = :scrapeInfo, updatedDt = :updatedDt",
            ExpressionAttributeNames: {
                "#scrapeInfo": "scrape-info",
            },
            ExpressionAttributeValues: {
                ":scrapeInfo": scrapeInfo,
                ":updatedDt": new Date().toISOString(),
            },
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User updated", userId }),
        };
    } catch (err) {
        console.error("Error updating user:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update user" }),
        };
    }
}
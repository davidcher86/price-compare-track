// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {retrieveRecords} from '../../commons/utils/DynamoDBService'

// const client = new DynamoDBClient({ region: process.env.REGION });
// const ddb = DynamoDBDocumentClient.from(client);

export const getUserDetails = async (event: any) => {
    const userId = event.headers?.userId;

    console.log(`fetching request for details for userId: ${userId}`);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId or scrape-info" }),
        };
    }

    try {
        const userDetailsTableName = process.env.USER_DETAILS_TABLE || '';
        const userDetailsKey = { userId };
        const result = await retrieveRecords(userDetailsTableName, userDetailsKey);
        // const result = await ddb.send(new GetCommand({
        //     TableName: process.env.USER_DETAILS_TABLE,
        //     Key: { userId },
        // }));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }

        console.log("User details fetched successfully: ", result.Item);
        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (err) {
        console.error("Error fetching user details:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch user details" }),
        };
    }
}
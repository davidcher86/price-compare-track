// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {retrieveRecords} from '../../commons/utils/DynamoDBService'
// const client = new DynamoDBClient({ region: process.env.REGION });
// const ddb = DynamoDBDocumentClient.from(client);

export const getUserScrapes = async (event: any) => {
    const userId = event.headers?.userId;

    console.log(`fetching scrape data for userId: ${userId}`);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId or scrape-info" }),
        };
    }

    try {
        const userScrapeResultsTableName = process.env.RESULT_DB_TABLE_NAME || '';
        const userScrapeResultsRecord = { userId: userId };
        const result = await retrieveRecords(userScrapeResultsTableName, userScrapeResultsRecord);
        // const result = await ddb.send(new GetCommand({
        //     TableName: userScrapeResultsTableName,
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
            body: JSON.stringify({ error: "Failed to fetch user scrape results" }),
        };
    }
}
import {retrieveScrapeHistory} from '../../commons/utils/DynamoDBService'
// import {retrieveScrapeHistory} from '@utils/aws-sdk/DynamoDBService';

export const getScrapeResultData = async (event: any) => {
    const userId = event.headers?.userId;

    console.log(`fetching scrape data for userId: ${userId}`);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId" }),
        };
    }

    try {
        const userScrapeResultsTableName = process.env.RESULT_DB_TABLE_NAME || '';
        const userScrapeResultsRecord = { userId: userId };
        const result = await retrieveScrapeHistory(userId);

        console.log("Fetched user scrape results: ", JSON.stringify(result));
        if (!result.Items) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }

        console.log("User details fetched successfully: ", result.Items.length + " items found");
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (err) {
        console.error("Error fetching user details:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch user scrape history" }),
        };
    }
}
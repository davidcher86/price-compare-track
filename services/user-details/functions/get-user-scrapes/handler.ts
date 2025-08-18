import {retrieveScrapeHistory} from '../../../commons/utils/DynamoDBService'

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
        const result = await retrieveScrapeHistory(userId);

        // console.log("Fetched user scrape results: ", JSON.stringify(result));
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
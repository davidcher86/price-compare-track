import {retrieveScrapeResult} from '../../commons/utils/DynamoDBService'

export const getScrapeData = async (event: any) => {
    const body = JSON.parse(event.body);
    console.log(`body: ${JSON.stringify(body)}`);
    const {scrapeRequestId} = body.payload;

    const userId = event.headers?.userId;

    console.log(`fetching scrape data for scrapeRequestId: ${scrapeRequestId}`);

    if (userId == undefined || scrapeRequestId == undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing params" }),
        };
    }

    try {
        const userScrapeResultsTableName = process.env.RESULT_DB_TABLE_NAME || '';
        const result = await retrieveScrapeResult(userScrapeResultsTableName, userId, scrapeRequestId);

        console.log("Fetched scrape result: ", JSON.stringify(result));
        if (!result.Items) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "result not found" }),
            };
        }

        console.log("Scrape results fetched successfully: ", result.Items.length + " items found");
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (err) {
        console.error("Error fetching scrape results:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch scrape results" }),
        };
    }
}
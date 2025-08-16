import {retrieveScrapeResult} from '../../commons/utils/DynamoDBService'

export const getScrapeData = async (event: any) => {
    const body = JSON.parse(event.body);
    console.log(`body: ${JSON.stringify(body)}`);
    const {scrapeRequestId} = body.payload;

    const userId = event.headers?.userId;

    // console.log(`fetching scrape data for scrapeRequestId: ${scrapeRequestId}`);
    // console.log(`userId from headers: ${userId}`);
    // console.log(`userId type: ${typeof userId}`);
    // console.log(`scrapeRequestId type: ${typeof scrapeRequestId}`);

    if (userId == undefined || scrapeRequestId == undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing params" }),
        };
    }

    try {
        console.log(`Making query with userId: "${userId}" and scrapeRequestId: "${scrapeRequestId}"`);
        const result = await retrieveScrapeResult(userId, scrapeRequestId);

        console.log(`Query found ${result.length} records`);
        if (!result.Items || result.Items.length === 0) {
            console.log("No items found in result");
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
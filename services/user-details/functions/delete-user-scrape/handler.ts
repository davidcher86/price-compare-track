import {retrieveScrapeResult, deleteScrapeResults} from '../../commons/utils/DynamoDBService'

export const deleteScrape = async (event: any) => {
    const body = JSON.parse(event.body);
    console.log(`body: ${JSON.stringify(body)}`);
    const { scrapeRequestId } = body.payload;

    const userId = event.headers?.userId;

    if (userId == undefined || scrapeRequestId == undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing params" }),
        };
    }

    try {
        console.log(`Making delete request for userId: "${userId}" and scrapeRequestId: "${scrapeRequestId}"`);
        const result = await deleteScrapeResults(scrapeRequestId);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (err) {
        console.error("Error deleting scrape results:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to delete scrape results, for scrapeRequestId: " + scrapeRequestId }),
        };
    }
}
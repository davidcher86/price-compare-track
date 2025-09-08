import {deletePriceTrackResultsByScrapeCode} from '../../../commons/utils/DynamoDBService';

export const deleteScheduledPriceTrack = async (event: any) => {
    try {

        console.log(`event: ${JSON.stringify(event)}`);
        const scrapeCode = event.headers?.scrapeCode;

        const result = await deletePriceTrackResultsByScrapeCode(scrapeCode);

        console.log(`Delete result: ${JSON.stringify(result)}`);

        return {
            statusCode: 200,
            body: "done"
        }
    } catch (error) {
        console.error("failed to delete scheduled price track:", error)
        return {
            statusCode: 500,
            body: `error: ${error}`
        }
    }
}

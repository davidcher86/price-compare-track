import {deletePScheduledPriceTrackById, deletePriceTrackResults} from '../../../commons/utils/DynamoDBService';

export const deleteScheduledPriceTrack = async (event: any) => {
    try {
        console.log(`event: ${JSON.stringify(event)}`);
        const id = event.headers?.id;
        // const ifDeleteScrapes = event.headers?.ifDeleteScrapes === 'true';
        const scrapeCode = event.headers?.scrapeCode;

        if (scrapeCode !== undefined && scrapeCode !== null && scrapeCode !== '')
            await deletePriceTrackResults(scrapeCode);

        const result = await deletePScheduledPriceTrackById(id);

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

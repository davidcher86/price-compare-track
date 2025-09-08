import {retrievePriceTrackResultsScrapeCodeGrouped} from '../../../commons/utils/DynamoDBService';

export const retrievePriceTrackList = async (event: any) => {
    try {
        const userId = event.headers?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing userId header' }),
            };
        }

        const result = await retrievePriceTrackResultsScrapeCodeGrouped(userId);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error retrieving price track results by user ID:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve price track results' }),
        };
    }
};
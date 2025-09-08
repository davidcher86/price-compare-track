import {retrievePriceTrackResultsByScrapeCode} from '../../../commons/utils/DynamoDBService';

export const retrievePriceTrackResultDetails = async (event: any) => {
    try {
        const scrapeCode = event.headers.scrapeCode;

        if (!scrapeCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing scrapeCode header parameter' }),
            };
        }

        const result = await retrievePriceTrackResultsByScrapeCode(scrapeCode);
        
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error retrieving price track result details:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve price track result details' }),
        };
    }
};

import {togglePriceTrackEnableProp} from '../../../commons/utils/DynamoDBService';

export const togglePriceTrackEnabled = async (event: any) => {
    try {
        console.log('Full event:', JSON.stringify(event, null, 2));
        
        const id = event.headers?.id;
        const enabledStr = event.headers?.enabled;
        
        console.log('Raw values from headers - id:', id, 'enabled:', enabledStr);
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id in request headers' }),
            };
        }

        // Convert string to boolean properly
        const enabled = enabledStr === 'true' || enabledStr === true;
        console.log('Parsed enabled value:', enabled, 'type:', typeof enabled);

        const result = await togglePriceTrackEnableProp(id, enabled);
        console.log("Toggle result for toggle price track:", result);
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

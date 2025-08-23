import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

interface FinalScrapeData {
    title: string;
    meta?: Record<string, any>;
}

export const handler = async (event: any): Promise<{ status: string, message: string, data: any }> => {
    try {
        console.log('event:', JSON.stringify(event));
        const {userId, scrapeInfo, priceTrackData} = event;

        const formattedPrice = parseFloat(priceTrackData.price.replace(/\D/g, ''));
        const params = {
            TableName: process.env.PRICE_TRACK_TABLE,
            Item: {
                key: `${userId}-${scrapeInfo.name}-${uuidv4()}`,
                userId: userId,
                productName: scrapeInfo.name,
                price: formattedPrice,
                date: new Date().toISOString(),
            },
        };

        await ddb.send(new PutCommand(params));

        console.log(`saved data to dynamoDB: ${JSON.stringify(params)}`);
        return {
            status: 'success',
            message: 'Price track data saved successfully',
            data: {
                userId: userId,
                productName: scrapeInfo.name,
                price: formattedPrice,
                date: new Date().toISOString(),
            }
        };
    } catch (error) {
        console.error('Error extracting data:', error);
        throw new Error('Failed to extract data from HTML');
    }
};
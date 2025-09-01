import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as UUID4 } from "uuid";

import {savePriceTrackRecord} from '../../../../commons/utils/DynamoDBService'

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

interface PriceTrackData {
    image: string;
    name: string;
    price: string;
}

interface ExtractedData {
    scrapeInfo: ScrapeInfo;
    startScrapeDt: string;
    endScrapeDt: string;
    priceTrackData: PriceTrackData;
}

interface ScrapeInfo {
    id: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href: string;
    name?: string;
    bucketName: string;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
    scrapeCode: string;
}

export const updateHistoryData = async (event: ExtractedData): Promise<any> => {
    try {
        const {priceTrackData, scrapeInfo, startScrapeDt, endScrapeDt} = event;

        // console.log('event:', JSON.stringify(payload));
        const formattedPrice = parseFloat(priceTrackData.price.replace(/\D/g, ''));
        const payload = {
            id: UUID4(),
            userId: scrapeInfo.userId,
            source: scrapeInfo.source,
            productName: scrapeInfo.name,
            productPrice: formattedPrice,
            scrapeDate: new Date().toISOString(),
            startScrapeDt: startScrapeDt,
            endScrapeDt: endScrapeDt,
            scrapeCode: scrapeInfo.scrapeCode,
        };

        await savePriceTrackRecord(payload);

        console.log('Price track data recorded:', JSON.stringify(payload));

        return {
            status: 'SUCCESS',
            message: 'Price track data saved successfully',
            data: {
                userId: scrapeInfo.userId,
                productName: scrapeInfo.name,
                source: scrapeInfo.source,
                price: formattedPrice,
                date: new Date().toISOString(),
            }
        };
    } catch (error) {
        console.error('Error extracting data:', error);
        throw new Error('Failed to extract data from HTML');
    }
};
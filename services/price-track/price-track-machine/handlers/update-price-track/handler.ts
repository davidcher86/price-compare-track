import { v4 as UUID4 } from "uuid";
import {savePriceTrackRecord} from '../../../../commons/utils/DynamoDBService'
import {sendMessageToQueue, getDlqSqsName, generateDlqSqsPayload} from "../../../../commons/utils/SQSService.ts";
import { ExtractedDataWithPrice } from "../../../commons/models";

export const updateHistoryData = async (event: ExtractedDataWithPrice): Promise<any> => {
    try {
        console.log('recieved save extracted data event:', JSON.stringify(event));
        if (event == undefined) 
            throw new Error("event is undefined");
        const {priceTrackData, scrapeInfo, startScrapeDt, endScrapeDt} = event;

        const payload = {
            id: UUID4(),
            userId: scrapeInfo.userId,
            source: scrapeInfo.source,
            productName: scrapeInfo.name,
            productPrice: priceTrackData.price,
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
                price: priceTrackData.price,
                date: new Date().toISOString(),
            }
        };
    } catch (error) {
        console.error('Error saving extracted data', JSON.stringify(error));
        await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event, 'SCHEDULED_DATA_SAVE_FAILED', `Error: ${error}`));
        throw new Error('Failed to save extracted data');
    }
};
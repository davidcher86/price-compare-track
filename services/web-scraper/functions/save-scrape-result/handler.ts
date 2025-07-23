import { postToHttpApiGateway } from "../../commons/utils/ApiGatewayService.ts";
import {saveRecord} from "../../commons/utils/DynamoDBService.ts";
import {deletePayload, retrievePayload} from "../../commons/utils/S3Service.ts";
import process from "node:process";

export const handleSqsMessage = async (event: any) => {
    console.log('Received SQS event:', JSON.stringify(event));
    for (const message of event.Records) {
        console.log('message: ' + JSON.stringify(message));
        console.log('body: ' + JSON.stringify(message.body));
        const body = JSON.parse(message.body);

        console.log("sent event: " + JSON.stringify(body));
        await save(body);
    }
}

const save = async (event: any) => {
    console.log('event to save:' + JSON.stringify(event));

    const {scrapeRequestId, scrapeId, scrapeInfo, userId, query, bucketKey, scrapeDt, startScrapeDt, endScrapeDt} = event;

    try {
        const bucketName = process.env.STAGE === 'prod'
            ? (process.env.S3_EXTRACTED_DATA_BUCKET_NAME || '')
            : "sls-scrape-extracted-data-prod";

        const rawPayload = await retrievePayload(bucketName, bucketKey);

        console.log(`Saving results for scrapeRequestId: ${scrapeRequestId}, userId: ${userId}, query: ${JSON.stringify(query)}`);

        const tableName = process.env.STAGE === 'prod'
            ? (process.env.RESULT_DB_TABLE_NAME || '')
            : "user-scrape-results-prod";

        const scrapeResultRecord = {
            scrapeId: scrapeId,
            scrapeRequestId: scrapeRequestId,
            userId: userId,
            scrapeDate: new Date().toISOString(),
            query: query,
            scrapeDt: scrapeDt, 
            startScrapeDt: startScrapeDt, 
            endScrapeDt: endScrapeDt,
            source: scrapeInfo.name,
            results: JSON.stringify(rawPayload),
        };
        
        await saveRecord(tableName,scrapeResultRecord);

        // await deletePayload(bucketName, bucketKey);

        await sendClientNotification(userId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scraping completed successfully" }),
        }
    } catch (error) {
        console.error('Error during saving user scrape extracted results:', error);
        throw error;
    }
}

const sendClientNotification = async (userId: string) => {
    try {
        const functionName = 'sls-user-details-prod-notifyClient'; // Replace with your actual function name or ARN
        const res = await postToHttpApiGateway(functionName, { userId: userId, message: 'Hello from another function!' })
    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            body: `Error sending notification: ${(error as Error).message}`,
        };
    }
}

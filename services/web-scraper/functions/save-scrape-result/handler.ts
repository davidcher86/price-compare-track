import { postToHttpApiGateway } from "@shared-commons/utils/ApiGatewayService";
import {saveRecord} from "@shared-commons/utils/DynamoDBService";
import {deletePayload, retrievePayload, getScrapeExtractedDataBucketName, getUserScrapeResultsBucketName} from "@shared-commons/utils/S3Service";

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

    const {scrapeRequestId, scrapeId, scrapeInfo, userId, query, bucketKey, scrapeDate, startScrapeDt, endScrapeDt} = event;

    try {
        const bucketName = getScrapeExtractedDataBucketName();

        const rawPayload = await retrievePayload(bucketName, bucketKey);

        console.log(`Saving results for scrapeRequestId: ${scrapeRequestId}, userId: ${userId}, query: ${JSON.stringify(query)}`);

        const tableName = getUserScrapeResultsBucketName();

        const scrapeResultRecord = {
            scrapeId: scrapeId,
            scrapeRequestId: scrapeRequestId,
            userId: userId,
            query: query,
            scrapeDate: scrapeDate, 
            startScrapeDt: startScrapeDt, 
            endScrapeDt: endScrapeDt,
            source: scrapeInfo.name,
            results: JSON.stringify(rawPayload),
        };
        
        // await saveRecord(tableName,scrapeResultRecord);

        // await deletePayload(bucketName, bucketKey);

        await sendClientNotification(userId, `{"status": "SCRAPE_COMPLETED", "source": "${scrapeInfo.name}"}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scraping completed successfully" }),
        }
    } catch (error) {
        console.error('Error during saving user scrape extracted results:', error);
        throw error;
    }
}

const sendClientNotification = async (userId: string, message: string) => {
    try {
        const functionName = 'sls-user-details-prod-notifyClient'; // Replace with your actual function name or ARN
        const res = await postToHttpApiGateway(functionName, { userId: userId, message: message })
    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            body: `Error sending notification: ${(error as Error).message}`,
        };
    }
}

import {sendMessageToQueue} from "../../commons/utils/SQSService.ts";
import process from "node:process";
import { v4 as uuid4 } from "uuid";

export const formScrapeRequest = async (event: any) => {
    try {

        const body = JSON.parse(event.body);
        console.log(`body: ${JSON.stringify(body)}`);
        const {scrapeSources, query} = body.payload;
        const userId = event.headers?.userId;

        if (scrapeSources.length == 0 || query.length == 0 || userId == undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing params" }),
            };
        }

        const tmpUserId = uuid4();
        const scrapeRequestId = uuid4();
        const scrapeDt = new Date().toISOString();

        for (const scrapeSourceInfo of scrapeSources) {
            console.log(`sendingMessageTooQueue ${JSON.stringify(scrapeSourceInfo)}`);

            const scrapeId = uuid4();
            const sqsPayload = {
                scrapeRequestId: scrapeRequestId,
                scrapeId: scrapeId,
                scrapeInfo: scrapeSourceInfo,
                userId: tmpUserId,
                scrapeDt: scrapeDt,
                query: query
            }

            const sqsUrl = process.env.STAGE === 'prod'
                ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_SCRAPE_REQUEST}`
                : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/accept-scrape-request-queue-prod`;

            console.log(`SQS Message: ${JSON.stringify(sqsPayload)}`);
            const sqsResponse = await sendMessageToQueue(sqsUrl, sqsPayload);
            console.log(`SQS Response: ${sqsResponse}`);
        }

        return {
            statusCode: 200,
            body: "done"
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500,
            body: `error: ${error}`
        }
    }
}

import {sendMessageToQueue, getAccepetScrapeRequestSqsName} from "../../commons/utils/SQSService.ts";
import { v4 as uuid4 } from "uuid";

export const formScrapeRequest = async (event: any) => {
    try {

        const body = JSON.parse(event.body);
        console.log(`body: ${JSON.stringify(body)}`);
        const {scrapeSources, query} = body;
        const userId = event.headers?.userId;

        if (scrapeSources.length == 0 || query.length == 0 || userId == undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing params" }),
            };
        }

        const scrapeRequestId = uuid4();
        const scrapeDt = new Date().toISOString();

        for (const scrapeSourceInfo of scrapeSources) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`sendingMessageTooQueue ${JSON.stringify(scrapeSourceInfo)}`);

            const scrapeId = uuid4();
            const sqsPayload = {
                scrapeRequestId: scrapeRequestId,
                scrapeId: scrapeId,
                scrapeInfo: scrapeSourceInfo,
                userId: userId,
                scrapeDate: scrapeDt,
                query: query,
                triesCount: 1
            }
            console.log(scrapeSourceInfo.name);
            await sendMessageToQueue(getAccepetScrapeRequestSqsName(), sqsPayload);
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

import {sendMessageToQueue, getAcceptedScrapeRequestSqsName} from "../../../commons/utils/SQSService";
import { v4 as uuid4 } from "uuid";

export const formScrapeRequest = async (event: any) => {
    try {

        const body = JSON.parse(event.body);
        console.log(`body: ${JSON.stringify(body)}`);
        const {scrapeSources, query} = body;
        const userId = event.headers?.userId;
        console.log(`userId: ${userId}`);

        if (scrapeSources.length == 0 || query.length == 0 || userId == undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing params" }),
            };
        }

        const scrapeRequestId = uuid4();
        const scrapeDt = new Date().toISOString();
        const scrapeSourcesFixed = scrapeSources.map((source: any) => ({
            source: source.name,
        }));

        for (const scrapeSourceInfo of scrapeSourcesFixed) {
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
            console.log("sqsPayload: ", JSON.stringify(sqsPayload));
            await sendMessageToQueue(getAcceptedScrapeRequestSqsName(), sqsPayload);
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

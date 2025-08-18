import {sendMessageToQueue, getAccepetScrapeRequestSqsName} from "@shared-commons/utils/SQSService.ts";
import { v4 as uuid4 } from "uuid";

export const handleSqsMessage = async (event: any) => {
    console.log('Received DLQ SQS event:', JSON.stringify(event));
    for (const message of event.Records) {
        console.log('message: ' + JSON.stringify(message));
        console.log('body: ' + JSON.stringify(message.body));
        const body = JSON.parse(message.body);

        console.log("sent event: " + JSON.stringify(body));
        await handleMsg(body);
    }
}

export const handleMsg = async (payload: any) => {
    try {
        const {} = payload;
        // const body = JSON.parse(event.body);
        console.log(`payload: `);
        console.log(payload);
        console.log(`error: ${payload.error}`);

        switch (payload.event) {  
            case 'SCRAPE_FAILED':
                console.log(`scrape failed, error: ${payload.error}`);
                console.log(`resending to accept scrape request queue for re-scraping`);
                if (payload.triesCount === undefined) {
                    payload.triesCount = 1;
                    console.log(`Initializing triesCount to 1 for payload: ${JSON.stringify(payload)}`);
                    // await sendMessageToQueue(getAccepetScrapeRequestSqsName(), payload);
                    //TODO: return websocket message for re-scraping
                } else if (payload.triesCount < 3) {
                    payload.triesCount = payload.triesCount + 1;
                    console.log(`Incrementing triesCount to ${payload.triesCount} for payload: ${JSON.stringify(payload)}`);
                    // await sendMessageToQueue(getAccepetScrapeRequestSqsName(), payload);
                    //TODO: return websocket message for re-scraping
                } else {
                    console.log(`Max retries reached for payload: ${JSON.stringify(payload)}`);
                    break; 
                    // TODO: return websocket message for failed scraping
                }

                console.log(`resending to accept scrape request queue for re-scraping`);
                await sendMessageToQueue(getAccepetScrapeRequestSqsName(), payload);
                break;
            // case 'EXTRACT_DATA_FAILED':
            //     console.log(`extract data failed, error: ${body.error}`);
            //     // Handle extract data failure
            //     break;
            default:
                console.log(`Unknown event type: ${payload.event}`);
                break;
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

import {sendMessageToQueue, getAccepetScrapeRequestSqsName} from "../../commons/utils/SQSService.ts";
import process from "node:process";
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

        // const body = JSON.parse(event.body);
        console.log(`payload: `);
        console.log(payload);
        console.log(`error: ${payload.error}`);

        switch (payload.event) {  
            case 'SCRAPE_FAILED':
                console.log(`scrape failed, error: ${payload.error}`);
                console.log(`resending to accept scrape request queue for re-scraping`);
                if (payload.triesCount === undefined || payload.triesCount < 3) {
                    payload.event.triesCount = payload.triesCount ? payload.triesCount + 1 : 1;
                    await sendMessageToQueue(getAccepetScrapeRequestSqsName(), payload);
                } else {
                    console.log(`Max retries reached for payload: ${JSON.stringify(payload)}`);
                    // TODO: return websocket message for failed scraping
                }
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

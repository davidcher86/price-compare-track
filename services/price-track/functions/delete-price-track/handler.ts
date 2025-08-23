// import {sendMessageToQueue, getAccepetScrapeRequestSqsName} from "@shared-commons/utils/SQSService";
// import { v4 as uuid4 } from "uuid";

export const deletePriceTrack = async (event: any) => {
    try {

        console.log(`body: ${JSON.stringify(event.body)}`);
        

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

import {retrieveAllEnabledPriceTrackItems} from "../../../../commons/utils/DynamoDBService";
// import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import {sendMessageToMachine} from '../../../../commons/utils/StepFunctionService';

interface PriceTrackItem {
    id: string;
    scrapeCode: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href?: string;
    name?: string;
    query?: string;
}

// const sfn = new SFNClient({ region: process.env.AWS_REGION });

export const getScrapeList = async () => {
    try {
        console.log("getting all enabled scheduled price tracks");
        const result: PriceTrackItem[] = await retrieveAllEnabledPriceTrackItems();
        console.log("result items count", result.length);

        const scrapeItems = result.filter(item => item.enabled === "true" && item.href !==  '' && item.href !== undefined);
        console.log("items to process count", scrapeItems.length);

        for (const item of scrapeItems) {
            const scrapeSiteEvent = {
                scrapeCode: item.scrapeCode,
                userId: item.userId,
                source: item.source,
                scrapeEngine: item.scrapeEngine,
                createDt: item.createDt,
                iteration: item.iteration,
                iterationType: item.iterationType,
                iterationStart: item.iterationStart,
                href: item.href,
                name: item.name,
                query: item.name,
            };
            console.log("payload", scrapeSiteEvent);

            await sendMessageToMachine(scrapeSiteEvent);
        }
    } catch (error) {
        console.error("Error sending Step Function command:", error);
    }
};
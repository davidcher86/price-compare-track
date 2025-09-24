import {retrieveAllEnabledPriceTrackItems} from "../../../../commons/utils/DynamoDBService";
import {sendMessageToMachine} from '../../../../commons/utils/StepFunctionService';
import { PriceTrackItem } from "../../../commons/models";

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
                createdDt: item.createdDt,
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
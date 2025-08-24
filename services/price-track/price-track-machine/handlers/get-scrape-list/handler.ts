import {retrieveAllEnabledPriceTrackItems} from "../../../../commons/utils/DynamoDBService";


interface PriceTrackItem {
    id: string;
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
}

export const getScrapeList = async (event: any) => {
    console.log("getting all enabled scheduled price tracks");
    const result: PriceTrackItem[] = await retrieveAllEnabledPriceTrackItems();
    console.log("result items count", result.length);

    const scrapeItems = result.filter(item => item.enabled === "true");
    console.log("items to process count", scrapeItems.length);
    return {
        scrapeList: (scrapeItems) ?? []
    };
};
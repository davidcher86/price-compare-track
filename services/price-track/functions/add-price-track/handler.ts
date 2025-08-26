import {addPriceTrackRecord} from "@shared-commons/utils/DynamoDBService";
import { v4 as uuid4 } from "uuid";

interface PriceTrackItem {
    id: string;
    scrapeCode: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string;
    img: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string;
    href?: string;
    name?: string;
}

export const addPriceTrackItem = async (event: any) => {
    const userId = event.headers?.userId;

    console.log(`adding price track item for userId: ${userId}`);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId" }),
        };
    }

    try {
        const body = JSON.parse(event.body);
        const priceTrackData = body.priceTrackItem || body;
        const { source, scrapeEngine, iteration, iterationType, iterationStart, enabled, href, name, img } = priceTrackData;

        const newRecord: PriceTrackItem = {
            id: uuid4(),
            scrapeCode: uuid4(),
            userId,
            source,
            scrapeEngine,
            iteration,
            iterationType,
            iterationStart,
            img,
            enabled,
            href,
            name,
            createDt: new Date().toISOString()
        };
        await addPriceTrackRecord(newRecord);

        return {
            statusCode: 200,
            body: "new price track record added",
        };
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500,
            body: `error: ${error}`
        }
    }
}

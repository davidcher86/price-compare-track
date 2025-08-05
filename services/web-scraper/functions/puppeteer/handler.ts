import {ScraperInterface} from "./interfaces/ScraperInterface.ts";
import {NewEggScrapeConfigReader} from "./sourcesScrapeConfigs/NewEgg/NewEggScrapeConfigReader.ts";
import {AliExpressScrapeConfigReader} from "./sourcesScrapeConfigs/AliExpress/AliExpressScrapeConfigReader.ts";
import {EbayScrapeConfigReader} from "./sourcesScrapeConfigs/Ebay/EbayScrapeConfigReader.ts";
import {AmazonScrapeConfigReader} from "./sourcesScrapeConfigs/Amazon/AmazonScrapeConfigReader.ts";
import {PuppeteerScrapeService} from "./utils/PuppeteerScrapeService.ts";
import { v4 as uuid4 } from "uuid";
import {savePayload} from "../../commons/utils/S3Service.ts";
import * as process from "node:process";
import {getSecretValue} from "../../commons/utils/SecretManager.ts";
import {sendMessageToQueue, getDlqSqsName, generateDlqSqsPayload, getHtmlRawResultSqsName} from "../../commons/utils/SQSService.ts";

export const handleSqsMessage = async (event: any) => {
    console.log('Received SQS event:', JSON.stringify(event));
    for (const message of event.Records) {

        console.log('message: ' + JSON.stringify(message));
        console.log('body: ' + JSON.stringify(message.body));
        const body = JSON.parse(message.body);

        // const event = JSON.parse(body)
        console.log("sent event: " + JSON.stringify(body));
        await scrape(body);
    }
}

const scrape = async (event: any) => {
    console.log('event for scrape:' + JSON.stringify(event));
    const {scrapeId, scrapeInfo, query, userId, scrapeRequestId, scrapeDt} = event;
    console.log("scrapeInfo: " + JSON.stringify(scrapeInfo));

    try {
        if (scrapeInfo == undefined || query == undefined)
            throw new Error("scrapeInfo or query is undefined");

        let scrapeService: ScraperInterface;

        console.log("scrapeInfo.name " + scrapeInfo.name);

        switch (scrapeInfo.name.toLowerCase()) {
            case 'newegg':
                console.log("using NewEgg scrape configs")
                scrapeService = new PuppeteerScrapeService(new NewEggScrapeConfigReader());
                break;
            case 'ebay':
                console.log("using Ebay scrape configs")
                scrapeService = new PuppeteerScrapeService(new EbayScrapeConfigReader());
                break;
            case 'amazon':
                console.log("using Amazon scrape configs")
                // new PuppeteerScrapeListService(null, null);
                scrapeService = new PuppeteerScrapeService(new AmazonScrapeConfigReader());
                break;
            case 'aliexpress':
            default:
                console.log("using AliExpress scrape configs")
                scrapeService = new PuppeteerScrapeService(new AliExpressScrapeConfigReader());
                break;
        }

        const startScrapeDt = new Date().toISOString();
        const html = await scrapeService.start(query, scrapeInfo.userId, scrapeInfo);
        const endScrapeDt = new Date().toISOString();

        const bucketKey = `${scrapeInfo.name.replace(/\s+/g, "")}-${userId}-${uuid4()}`;
        const bucketName = process.env.STAGE === 'prod'
            ? (process.env.S3_RAW_HTML_RESULT_BUCKET_NAME || '')
            : "sls-scrape-html-raw-results-prod";
        await savePayload(html, bucketName, bucketKey, 'text/html');

        const sqsPayload = {
            scrapeRequestId: scrapeRequestId,
            scrapeId: scrapeId,
            status: "SCRAPE_RAW_HTML_COMPLETED",
            bucketKey: bucketKey,
            userId: userId,
            scrapeInfo: scrapeInfo,
            scrapeDt: scrapeDt,
            startScrapeDt: startScrapeDt,
            endScrapeDt: endScrapeDt,
            query: query,
        }

        // const sqsUrl = getHtmlRawResultSqsName()

        // console.log("sqsPayload: " + JSON.stringify(sqsPayload) + " to " + sqsUrl);
        await sendMessageToQueue(getHtmlRawResultSqsName(), sqsPayload);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scraping completed successfully" }),
        }
    } catch (error: ErrorMessage | any) {
        console.error('Error during scraping:', error);
        await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event, error.event, error.errorMessage));
        throw new Error('Scrape process failed, error: ' + error);
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}


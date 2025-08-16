import {AliExpressExtractData} from "./dataExtractors/AliExpress/AliEpressDataExtractor.ts";
import {NewEggScrapeConfigReader} from "./dataExtractors/NewEgg/NewEggScrapeConfigReader.ts";
import {AliExpressScrapeConfigReader} from "./dataExtractors/AliExpress/AliExpressScrapeConfigReader.ts";
import {SimpleExtractData} from "./dataExtractors/SimpleExtractData.ts";
import {AmazonExtractData} from "./dataExtractors/Amazon/AmazonExtractor.ts";
import {BanggoodScrapeConfigReader} from "./dataExtractors/Banggood/BanggoodScrapeConfigReader.ts";
import { BanggoodExtractData } from "./dataExtractors/Banggood/BanggoodExtractor.ts";
import {EbayScrapeConfigReader} from "./dataExtractors/Ebay/EbayScrapeConfigReader.ts";
import {AmazonScrapeConfigReader} from "./dataExtractors/Amazon/AmazonScrapeConfigReader.ts";
import {ExtractDataInterface} from "./interfaces/ExtractDataInterface.ts";
import {EbayExtractData} from "./dataExtractors/Ebay/EbayExtractData.ts";
import process from "node:process";
import {NewEggExtractData} from "./dataExtractors/NewEgg/NewEggExtractData.ts";
import { retrievePayload, deletePayload, savePayload, getScrapeExtractedDataBucketName } from '../../commons/utils/S3Service.ts';
import {sendMessageToQueue, getDlqSqsName, getExtractDataSqsName, generateDlqSqsPayload} from "../../commons/utils/SQSService.ts";

export const handleSqsMessage = async (event: any) => {
    console.log('Received SQS event:', JSON.stringify(event));
    for (const message of event.Records) {
        console.log('message: ' + JSON.stringify(message));
        console.log('body: ' + JSON.stringify(message.body));
        const body = JSON.parse(message.body);

        console.log("sent event: " + JSON.stringify(body));
        await extract(body);
    }
}

const extract = async (event: any) => {
    console.log('event for scrape:' + JSON.stringify(event));

    const {scrapeId, scrapeInfo, userId, query, bucketKey, scrapeRequestId, scrapeDate, startScrapeDt, endScrapeDt} = event;
    console.log(`scrapeInfo: ${JSON.stringify(scrapeInfo)}, userId: ${userId}, query: ${JSON.stringify(query)}`);

    try {
        if (scrapeInfo == undefined || query == undefined || userId == undefined) {
            throw new Error("scrapeInfo, query or userId is undefined");
            // await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event,"some data is undefined"));
            // return {
            //     statusCode: 500,
            //     body: JSON.stringify({ message: "some data is undefined" }),
            // }
        }

    // try {
        console.log('event:', JSON.stringify(event));
        const bucketName = getScrapeExtractedDataBucketName();

        const html = await retrievePayload(bucketName, bucketKey);
        if (html.length === 0) {
            throw new Error("scraped raw HTML content is empty");
            // await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event, "HTML content is empty"));
            // // throw new Error('HTML content is empty');
            // return {
            //     statusCode: 500,
            //     body: JSON.stringify({ message: "HTML content is empty" }),
            // }
        }

        let extractDataService: ExtractDataInterface;

        console.log("scrapeInfo.name " + scrapeInfo.name);

        switch (scrapeInfo.name.toLowerCase()) {
            case 'banggood':
                console.log("using Banggood scrape configs")
                extractDataService = new BanggoodExtractData(new BanggoodScrapeConfigReader());
                break;
            case 'newegg':
                console.log("using NewEgg scrape configs")
                extractDataService = new NewEggExtractData(new NewEggScrapeConfigReader());
                break;
            case 'ebay':
                console.log("using Ebay scrape configs")
                extractDataService = new EbayExtractData(new EbayScrapeConfigReader());
                break;
            case 'amazon':
                console.log("using Amazon scrape configs")
                extractDataService = new AmazonExtractData(new AmazonScrapeConfigReader());
                break;
            case 'aliexpress':
            default:
                console.log("using AliExpress scrape configs")
                extractDataService = new AliExpressExtractData(new AliExpressScrapeConfigReader());
                break;
        }


        const results = await extractDataService.extract(html, query);

        if (results.length === 0) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "no results from extracting items from raw html" }),
            };
        }
        
        console.log(`Extracted results: ${JSON.stringify(results)}`);
        const saveExtractedBucketName = getScrapeExtractedDataBucketName();
        const saveExtractedBucketKey = bucketKey + '-extracted';
        await savePayload(JSON.stringify(results), saveExtractedBucketName, saveExtractedBucketKey, 'text/html');

        const sqsPayload = {
            scrapeRequestId: scrapeRequestId,
            scrapeId: scrapeId,
            bucketKey: saveExtractedBucketKey,
            userId: userId,
            scrapeInfo: scrapeInfo,
            scrapeDate: scrapeDate, 
            startScrapeDt: startScrapeDt, 
            endScrapeDt: endScrapeDt,
            query: query,
        }

        await sendMessageToQueue(getExtractDataSqsName(),sqsPayload);

        // await deletePayload(bucketName, bucketKey);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scraping completed successfully" }),
        }
    } catch (error: ErrorMessage | any) {
        console.error('Error during scraping:', error);
        await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event,error.status, error.errorMessage));
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error}),
        }
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}


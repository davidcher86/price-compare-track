// Polyfill for File constructor that undici expects in browser environment
if (typeof globalThis.File === 'undefined') {
    (globalThis as any).File = class File {
        constructor(fileBits: any[], fileName: string, options?: any) {
            this.name = fileName;
            this.lastModified = options?.lastModified || Date.now();
            this.size = 0;
            this.type = options?.type || '';
            this.webkitRelativePath = '';
        }
        name: string;
        lastModified: number;
        size: number;
        type: string;
        webkitRelativePath: string;
    };
}

import {AliExpressExtractData} from "./dataExtractors/AliExpress/AliEpressDataExtractor";
import {NewEggScrapeConfigReader} from "../../../commons/scrapers/sourcesScrapeConfigs/NewEgg/NewEggScrapeConfigReader";
import {AliExpressScrapeConfigReader} from "../../../commons/scrapers/sourcesScrapeConfigs/AliExpress/AliExpressScrapeConfigReader";
import {AmazonExtractData} from "./dataExtractors/Amazon/AmazonExtractor";
import {BanggoodScrapeConfigReader} from "../../../commons/scrapers/sourcesScrapeConfigs/Banggood/BanggoodScrapeConfigReader";
import { BanggoodExtractData } from "./dataExtractors/Banggood/BanggoodExtractor";
import {EbayScrapeConfigReader} from "../../../commons/scrapers/sourcesScrapeConfigs/Ebay/EbayScrapeConfigReader";
import {AmazonScrapeConfigReader} from "../../../commons/scrapers/sourcesScrapeConfigs/Amazon/AmazonScrapeConfigReader";
import {ExtractDataInterface} from "./interfaces/ExtractDataInterface";
import {EbayExtractData} from "./dataExtractors/Ebay/EbayExtractData";
import {NewEggExtractData} from "./dataExtractors/NewEgg/NewEggExtractData";
import { retrievePayload, deletePayload, savePayload, getScrapeExtractedDataBucketName, getScrapeHtmlRawResultsBucketName } from '../../../commons/utils/S3Service';
import {sendMessageToQueue, getDlqSqsName, getExtractDataSqsName, generateDlqSqsPayload} from "../../../commons/utils/SQSService";

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
        const bucketName = getScrapeHtmlRawResultsBucketName();

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

        console.log("scrapeInfo.source " + scrapeInfo.source);

        switch (scrapeInfo.source.toLowerCase()) {
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

        // return {
        //     statusCode: 200,
        //     body: JSON.stringify({ message: "Scraping completed successfully" }),
        // }
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


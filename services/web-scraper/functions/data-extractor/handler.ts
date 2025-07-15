import {AliExpressExtractData} from "./dataExtractors/AliExpress/AliEpressDataExtractor.ts";
import {NewEggScrapeConfigReader} from "./dataExtractors/NewEgg/NewEggScrapeConfigReader.ts";
import {AliExpressScrapeConfigReader} from "./dataExtractors/AliExpress/AliExpressScrapeConfigReader.ts";
import {SimpleExtractData} from "./dataExtractors/SimpleExtractData.ts";
import {EbayScrapeConfigReader} from "./dataExtractors/Ebay/EbayScrapeConfigReader.ts";
import {AmazonScrapeConfigReader} from "./dataExtractors/Amazon/AmazonScrapeConfigReader.ts";
import {ExtractDataInterface} from "./interfaces/ExtractDataInterface.ts";
import process from "node:process";
import { retrievePayload, deletePayload, savePayload } from '../../commons/utils/S3Service.ts';
import {sendMessageToQueue} from "../../commons/utils/SQSService.ts";

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

    const {scrapeId, scrapeInfo, userId, query, bucketKey, scrapeRequestId, scrapeDt, startScrapeDt, endScrapeDt} = event;
    console.log(`scrapeInfo: ${JSON.stringify(scrapeInfo)}, userId: ${userId}, query: ${JSON.stringify(query)}`);

    if (scrapeInfo == undefined || query == undefined || userId == undefined)
        throw new Error("some data is undefined");

    try {
        console.log('event:', JSON.stringify(event));
        const bucketName = process.env.STAGE === 'prod'
            ? (process.env.S3_RAW_HTML_RESULT_BUCKET_NAME || '')
            : "sls-scrape-html-results-prod";

        const html = await retrievePayload(bucketName, bucketKey);
        if (html.length === 0)
            throw new Error('HTML content is empty');

        let extractDataService: ExtractDataInterface;

        console.log("scrapeInfo.name " + scrapeInfo.name);

        switch (scrapeInfo.name) {
            case 'NewEgg':
                console.log("using NewEgg scrape configs")
                extractDataService = new SimpleExtractData(new NewEggScrapeConfigReader());
                break;
            case 'Ebay':
                console.log("using Ebay scrape configs")
                extractDataService = new SimpleExtractData(new EbayScrapeConfigReader());
                break;
            case 'Amazon':
                console.log("using Amazon scrape configs")
                extractDataService = new SimpleExtractData(new AmazonScrapeConfigReader());
                break;
            case 'AliExpress':
            default:
                console.log("using AliExpress scrape configs")
                extractDataService = new AliExpressExtractData(new AliExpressScrapeConfigReader());
                break;
        }


        const results = await extractDataService.extract(html, scrapeInfo.userId);

        const saveExtractedBucketName = process.env.STAGE === 'prod'
            ? (process.env.S3_EXTRACTED_DATA_BUCKET_NAME || '')
            : "sls-extracted-data-prod";
        const saveExtractedBucketKey = bucketKey + '-extracted';
        await savePayload(JSON.stringify(results), saveExtractedBucketName, saveExtractedBucketKey, 'text/html');

        const sqsUrl = process.env.STAGE === 'prod'
            ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_EXTRACTED_DATA}`
            : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/extracted-data-results-queue-prod`;

        const sqsPayload = {
            scrapeRequestId: scrapeRequestId,
            scrapeId: scrapeId,
            bucketKey: saveExtractedBucketKey,
            userId: userId,
            scrapeInfo: scrapeInfo,
            scrapeDt: scrapeDt, 
            startScrapeDt: startScrapeDt, 
            endScrapeDt: endScrapeDt,
            query: query,
        }

        await sendMessageToQueue(sqsUrl,sqsPayload);

        // await deletePayload(bucketName, bucketKey);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scraping completed successfully" }),
        }
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    }
}


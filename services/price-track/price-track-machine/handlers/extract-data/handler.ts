import * as cheerio from 'cheerio';
// import AWS from 'aws-sdk';
import {ExtractDataInterface} from '../../../../commons/scrapers/interfaces/ExtractDataInterface';
import {getScrapeHtmlRawResultsBucketName, retrievePayload, deletePayload} from '../../../../commons/utils/S3Service'
// const s3 = new AWS.S3();
import {AliExpressExtractData} from "./dataExtractors/AliExpress/AliEpressDataExtractor";
import {NewEggScrapeConfigReader} from "../../../../commons/scrapers/sourcesScrapeConfigs/NewEgg/NewEggScrapeConfigReader";
import {AliExpressScrapeConfigReader} from "../../../../commons/scrapers/sourcesScrapeConfigs/AliExpress/AliExpressScrapeConfigReader";
import {AmazonExtractData} from "./dataExtractors/Amazon/AmazonExtractor";
import {BanggoodScrapeConfigReader} from "../../../../commons/scrapers/sourcesScrapeConfigs/Banggood/BanggoodScrapeConfigReader";
import { BanggoodExtractData } from "./dataExtractors/Banggood/BanggoodExtractor";
import {EbayScrapeConfigReader} from "../../../../commons/scrapers/sourcesScrapeConfigs/Ebay/EbayScrapeConfigReader";
import {AmazonScrapeConfigReader} from "../../../../commons/scrapers/sourcesScrapeConfigs/Amazon/AmazonScrapeConfigReader";
import {EbayExtractData} from "./dataExtractors/Ebay/EbayExtractData";
import {NewEggExtractData} from "./dataExtractors/NewEgg/NewEggExtractData";

interface PriceTrackData {
    // image: string;
    // name: string;
    price: string;
}

interface ExtractedData {
    scrapeInfo: ScrapeInfo;
    startScrapeDt: string;
    endScrapeDt: string;
    priceTrackData?: PriceTrackData;
}

interface ScrapeInfo {
    id: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href: string;
    name?: string;
    bucketName: string;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
    scrapeCode: string;
}

interface ExtractedDataEvent {
    stepScrapeSiteResult: StepScrapeSiteResult;
}

interface StepScrapeSiteResult {
    scrapeInfo?: ScrapeInfo;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
}

export const extractData = async (extractDataEvent: any): Promise<ExtractedData> => {
    try {
        console.log('recieved extract data event:', JSON.stringify(extractDataEvent));
        const { scrapeInfo, bucketKey, startScrapeDt, endScrapeDt } = extractDataEvent;
        if (bucketKey == undefined || scrapeInfo == undefined) 
            throw new Error("scrapeInfo, query or userId is undefined");
  
        const bucketName = getScrapeHtmlRawResultsBucketName();
        const html = await retrievePayload(bucketName, bucketKey);
        
        if (html.length === 0)
            throw new Error('HTML content is empty');
        
        let extractDataService: ExtractDataInterface;

        console.log("scrapeInfo source " + scrapeInfo.source);

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

        const priceTrackResults = await extractDataService.extract(html, scrapeInfo.userId);

        console.log('Extracted data:', priceTrackResults[0]);
        return {
            scrapeInfo: scrapeInfo,
            priceTrackData: priceTrackResults[0],
            startScrapeDt: startScrapeDt,
            endScrapeDt: endScrapeDt
        };    
    } catch (error) {
        console.error('Error extracting data:', error);
        throw new Error('Failed to extract data from HTML, error: ' + JSON.stringify(error));
    }
};

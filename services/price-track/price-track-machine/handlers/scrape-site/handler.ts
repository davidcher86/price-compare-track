import { v4 as uuid4 } from "uuid";
import {PuppeteerScrapeSingleItemService} from './scraper/PuppeteerScrapeSingleItemService.ts';
import {AmazonScrapeSingleItemService} from './scraper/AmazonScrapeSingleItemService.ts'; 
import {ScraperInterface} from '../../../../commons/scrapers/interfaces/ScraperInterface';
import {AliExpressScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/AliExpress/AliExpressScrapeConfigReader';
import {BanggoodScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Banggood/BanggoodScrapeConfigReader';
import {NewEggScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/NewEgg/NewEggScrapeConfigReader';
import {EbayScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Ebay/EbayScrapeConfigReader';
import {AmazonScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Amazon/AmazonScrapeConfigReader';
import {savePayload, getScrapeHtmlRawResultsBucketName} from "../../../../commons/utils/S3Service.ts";
import {sendMessageToQueue, getDlqSqsName, generateDlqSqsPayload} from "../../../../commons/utils/SQSService.ts";

interface ScrapeItemEvent {
    id: string;
    userId: string;
    source: string;
    scrapeCode: string;
    scrapeEngine?: string;
    createDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href: string;
    name?: string;
}

export const scrapeSite = async (scrapeInfo: ScrapeItemEvent) => {
    console.log('event for scrape:', scrapeInfo);

    console.log("accepted scrapeInfo: " + JSON.stringify(scrapeInfo));
    try {
        let scrapeService: ScraperInterface;

        console.log("scraping source " + scrapeInfo.source);

        switch (scrapeInfo.source.toLowerCase()) {
            case 'banggood':
                console.log("using Banggood scrape configs")
                scrapeService = new PuppeteerScrapeSingleItemService(new BanggoodScrapeConfigReader());
                break;
            case 'newegg':
                console.log("using NewEgg scrape configs")
                scrapeService = new PuppeteerScrapeSingleItemService(new NewEggScrapeConfigReader());
                break;
            case 'ebay':
                console.log("using Ebay scrape configs")
                scrapeService = new PuppeteerScrapeSingleItemService(new EbayScrapeConfigReader());
                break;
            case 'amazon':
                console.log("using Amazon scrape configs")
                scrapeService = new AmazonScrapeSingleItemService(new AmazonScrapeConfigReader());
                break;
            case 'aliexpress':
            default:
                console.log("using AliExpress scrape configs")
                scrapeService = new PuppeteerScrapeSingleItemService(new AliExpressScrapeConfigReader());
                break;
        }

        const startScrapeDt = new Date().toISOString();
        
        const html = await scrapeService.start(scrapeInfo);
        const endScrapeDt = new Date().toISOString();

        const bucketKey = `${scrapeInfo.source.replace(/\s+/g, "")}-SINGLE-ITEM-${scrapeInfo.userId}-${uuid4()}`;
        const bucketName = getScrapeHtmlRawResultsBucketName();
        await savePayload(html, bucketName, bucketKey, 'text/html');


        const eventPayload = {
            scrapeInfo: scrapeInfo,
            bucketKey: bucketKey,
            startScrapeDt: startScrapeDt,
            endScrapeDt: endScrapeDt
        }

        console.log('Scrape event payload: ' + JSON.stringify(eventPayload));
        return eventPayload;

    } catch (error: ErrorMessage | any) {
        console.error('Error during scraping:', error);
        await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(scrapeInfo, 'SCHEDULED_SCRAPER_FAILED', `Error: ${error}`));
        throw JSON.stringify(error);
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}
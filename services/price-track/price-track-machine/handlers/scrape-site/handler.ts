// import chromium from '@sparticuz/chromium-min';
// const isLocal = process.env.IS_LOCAL != undefined ? process.env.IS_LOCAL === 'false' : false;
// const isLocal =  false;
// import { v4 as uuidv4 } from "uuid";
// import puppeteerExtra from 'puppeteer-extra';
// import puppeteer, {Browser} from 'puppeteer';
// import AWS from 'aws-sdk';
// const s3 = new AWS.S3();
// const local = false;
import { v4 as uuid4 } from "uuid";
import {PuppeteerScrapeSingleItemService} from './scraper/PuppeteerScrapeSingleItemService.ts';
import {ScraperInterface} from '../../../../commons/scrapers/interfaces/ScraperInterface';
import {AliExpressScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/AliExpress/AliExpressScrapeConfigReader';
import {BanggoodScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Banggood/BanggoodScrapeConfigReader';
import {NewEggScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/NewEgg/NewEggScrapeConfigReader';
import {EbayScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Ebay/EbayScrapeConfigReader';
import {AmazonScrapeConfigReader} from '../../../../commons/scrapers/sourcesScrapeConfigs/Amazon/AmazonScrapeConfigReader';
import {savePayload, getScrapeHtmlRawResultsBucketName} from "../../../../commons/utils/S3Service.ts";
import {sendMessageToQueue, getDlqSqsName, generateDlqSqsPayload, getHtmlRawResultSqsName} from "../../../../commons/utils/SQSService.ts";


// export const scrapeSite2 = async (event:any) => {
//     const isLocal = false;
//     console.log('isLocal: ' + isLocal);
//     console.log("event: " + JSON.stringify(event));
//     const {userId, scrapeInfo} = event;


//     let browser;
//     console.log('userId: ' + userId);
//     console.log('scrapeInfo: ' + JSON.stringify(scrapeInfo));


//     try {
//         browser = !isLocal ? await puppeteerExtra.launch({
//             args: chromium.args,
//             defaultViewport: chromium.defaultViewport,
//             executablePath: await chromium.executablePath(
//                 'https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar',
//             ),
//             headless: chromium.headless,
//         })
//         : await puppeteer.launch({
//             executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//             args: scrapeInfo.disableSec ? [
//                 '--disable-web-security',
//             ] : [],
//             headless: true
//         });

//         let page = await browser.newPage();

//         if (scrapeInfo.disableSec) {
//             await page.setBypassCSP(true);
//         }
//         // await page.setBypassCSP(true);
//         page.on('console', (msg: any) => console.log('PAGE LOG:', msg.text()));


//         // const searchUrl = scraperInfo.url.replace('{query}', query);
//         console.log('searchUrl ' + scrapeInfo.url);

//         await page.goto(scrapeInfo.url, {waitUntil: 'domcontentloaded'});
//         // await page.exposeFunction("extractValue", this.extractValue);

//         console.log('waiting for: ' + scrapeInfo.scrapeArgs.loadSelector);
//         await page.waitForSelector(scrapeInfo.scrapeArgs.loadSelector);

//         const html = await page.content();

//         const bucketKey = `${scrapeInfo.name.replace(/\s+/g, "")}-${userId}-${uuidv4()}`;
//         const bucketName = process.env.S3_BUCKET_NAME;
//         if (!bucketName)
//             throw new Error('S3_BUCKET_NAME is not defined in environment variables');

//         await s3
//             .putObject({
//                 Bucket: bucketName,
//                 Key: bucketKey,
//                 Body: html,
//                 ContentType: 'text/html',
//             })
//             .promise();

//         console.log(`Item with key "${bucketKey}" added to bucket "${bucketName}".`);

//         return {
//             s3Key: bucketKey,
//             bucketName: bucketName,
//             scrapeInfo: scrapeInfo,
//             userId: userId,
//         };
//     } catch (error) {
//         console.log('error: ' + error);
//         throw Error('Scraping failed: ' + error);
//     } finally {
//         if (browser)
//             await browser.close();
//     }
// };

interface ScrapeItemEvent {
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
}

export const scrapeSite = async (scrapeInfo: ScrapeItemEvent) => {
    console.log('event for scrape:' + JSON.stringify(scrapeInfo));

    // const {scrapeInfo} = event;
    console.log("scrapeInfo: " + JSON.stringify(scrapeInfo));
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
                scrapeService = new PuppeteerScrapeSingleItemService(new AmazonScrapeConfigReader());
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

        return {
            scrapeInfo: scrapeInfo,
            bucketKey: bucketKey,
            startScrapeDt: startScrapeDt,
            endScrapeDt: endScrapeDt
        };

    } catch (error: ErrorMessage | any) {
        console.error('Error during scraping:', error);
        await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(scrapeInfo, 'SCRAPE_FAILED', `Error: ${error}`));
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}
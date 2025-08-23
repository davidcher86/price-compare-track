import chromium from '@sparticuz/chromium-min';
// const isLocal = process.env.IS_LOCAL != undefined ? process.env.IS_LOCAL === 'false' : false;
// const isLocal =  false;
import { v4 as uuidv4 } from "uuid";
import puppeteerExtra from 'puppeteer-extra';
import puppeteer, {Browser} from 'puppeteer';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
// const local = false;

export const handler = async (event:any) => {
    const isLocal = false;
    console.log('isLocal: ' + isLocal);
    console.log("event: " + JSON.stringify(event));
    const {userId, scrapeInfo} = event;


    let browser;
    console.log('userId: ' + userId);
    console.log('scrapeInfo: ' + JSON.stringify(scrapeInfo));


    try {
        browser = !isLocal ? await puppeteerExtra.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(
                'https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar',
            ),
            headless: chromium.headless,
        })
        : await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: scrapeInfo.disableSec ? [
                '--disable-web-security',
            ] : [],
            headless: true
        });

        let page = await browser.newPage();

        if (scrapeInfo.disableSec) {
            await page.setBypassCSP(true);
        }
        // await page.setBypassCSP(true);
        page.on('console', (msg: any) => console.log('PAGE LOG:', msg.text()));


        // const searchUrl = scraperInfo.url.replace('{query}', query);
        console.log('searchUrl ' + scrapeInfo.url);

        await page.goto(scrapeInfo.url, {waitUntil: 'domcontentloaded'});
        // await page.exposeFunction("extractValue", this.extractValue);

        console.log('waiting for: ' + scrapeInfo.scrapeArgs.loadSelector);
        await page.waitForSelector(scrapeInfo.scrapeArgs.loadSelector);

        const html = await page.content();

        const bucketKey = `${scrapeInfo.name.replace(/\s+/g, "")}-${userId}-${uuidv4()}`;
        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName)
            throw new Error('S3_BUCKET_NAME is not defined in environment variables');

        await s3
            .putObject({
                Bucket: bucketName,
                Key: bucketKey,
                Body: html,
                ContentType: 'text/html',
            })
            .promise();

        console.log(`Item with key "${bucketKey}" added to bucket "${bucketName}".`);

        return {
            s3Key: bucketKey,
            bucketName: bucketName,
            scrapeInfo: scrapeInfo,
            userId: userId,
        };
    } catch (error) {
        console.log('error: ' + error);
        throw Error('Scraping failed: ' + error);
    } finally {
        if (browser)
            await browser.close();
    }
};
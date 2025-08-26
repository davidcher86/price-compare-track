import {AbstractScrapeHandler} from '../../../../../commons/scrapers/AbstractPuppeteerScrapeService';
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";
// import puppeteerCore from "puppeteer-core";

interface ScrapeInfo {
    id: string;
    scrapeCode: string;
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
    query?: string;
}

export class PuppeteerScrapeSingleItemService extends AbstractScrapeHandler {

    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        super(scrapeConfigDataInterface);
    }

    protected async scrape(scrapeInfo: ScrapeInfo) {
        try {
            const disableSec = this.configData.getDisableSec();
            // const url = this.configData.getUrl();
            const loadSelector = this.configData.getSingleItemPageLoadSelector();
            // const name = this.configData.getName();

            console.log('puppeteer start single item page scraping: ' + name);
            let page;

            page = await this.browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

            if (disableSec) {
                await page.setBypassCSP(true);
            }

            const blockedResources = ['media', 'font'];
            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (blockedResources.includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });
            page.on('console', (msg: any) => console.log('PAGE LOG:', msg.text()));

            // const searchUrl = this.constructUri(scrapeInfo.query || '', url);
            console.log("scraping address: " + scrapeInfo.href);

            await page.goto(scrapeInfo.href, {waitUntil: 'networkidle2', timeout: 60 * 60 * 1000});
            if (loadSelector == undefined || loadSelector === null) {
                console.log('waiting for: ' + loadSelector);
                await page.waitForSelector(loadSelector);
            }

            const html = await page.content();

            return html;
        } catch (error) {
            throw {status: "SCRAPE_ERROR",message: 'failed scraping: ' + error};
        }
    }
}
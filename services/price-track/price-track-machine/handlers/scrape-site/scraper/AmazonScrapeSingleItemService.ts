import {PuppeteerScrapeSingleItemService} from './PuppeteerScrapeSingleItemService'
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";
import { ScraperScrapeInfo } from "../../../../commons/models";

export class AmazonScrapeSingleItemService extends PuppeteerScrapeSingleItemService {
    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        super(scrapeConfigDataInterface);
    }

    protected async scrape(scrapeInfo: ScraperScrapeInfo) {
        try {
            const disableSec = this.configData.getDisableSec();
            // const url = this.configData.getUrl();
            const loadSelector = this.configData.getSingleItemPageLoadSelector();
            // const name = this.configData.getName();

            // console.log('puppeteer start single item page scraping: ' + name);
            let page;

            page = await this.browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

            if (disableSec) {
                await page.setBypassCSP(true);
            }

            const blockedResources = this.configData.getBlockedResources() || [];
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
            const navigationTimeout = this.configData.getSingleItemTimeout() || 120000; // 2 minutes
            const waitUntil = this.configData.getSingleItemLoadWaitUntil() || 'domcontentloaded';
            
            await page.goto(scrapeInfo.href, {waitUntil: waitUntil, timeout: navigationTimeout});
            // invoke this only if the element exist
            const submitButton = await page.$('button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
            }
            if (loadSelector != undefined && loadSelector !== null) {
                console.log('waiting for: ' + loadSelector);
                await page.waitForSelector(loadSelector);
            }

            const html = await page.content();
            console.log('extracted')
            return html;
        } catch (error) {
            throw {status: "SCRAPE_ERROR",message: 'failed scraping: ' + error};
        }
    }
}
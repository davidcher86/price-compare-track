import {ScrapeConfigDataInterface} from "../../../../commons/scrapers/interfaces/ScrapeConfig";
// import puppeteerCore from "puppeteer-core";
// import process from "node:process";
// import {getSecretValue} from "../utils/SecretManager";
import {AbstractScrapeHandler} from '../../../../commons/scrapers/AbstractPuppeteerScrapeService';
// const chromium = require("@sparticuz/chromium");

export class PuppeteerScrapeListService extends AbstractScrapeHandler {

    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        super(scrapeConfigDataInterface);
    }

    protected async scrape(query: string) {
        try {
            const disableSec = this.configData.getDisableSec();
            const url = this.configData.getUrl();
            const loadSelector = this.configData.getLoadSelector();
            const name = this.configData.getName();

            console.log('puppeteer start list scraping: ' + name);
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

            const searchUrl = this.constructUri(query, url);
            console.log("scraping address: " + searchUrl);

            // await page.goto(searchUrl, {waitUntil: 'networkidle2'});
            await page.goto(searchUrl, {waitUntil: 'networkidle2', timeout: 60 * 60 * 1000});
            if (loadSelector == undefined || loadSelector === null) {
                console.log('waiting for: ' + loadSelector);
                await page.waitForSelector(loadSelector);
            }

            const html = await page.content();

            return html;
        } catch (error) {
            throw {status: "SCRAPE_ERROR",message: 'failed scraping: ' + error};
            // throw new Error('Scrape process failed, error: ' + error);
        }
    }
}
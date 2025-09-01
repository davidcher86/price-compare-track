import {ScrapeConfigDataInterface} from "../../../../commons/scrapers/interfaces/ScrapeConfig";
import {AbstractScrapeHandler} from '../../../../commons/scrapers/AbstractPuppeteerScrapeService';


interface ScrapeListInfo {
    query?: string;
}

export class PuppeteerScrapeListService extends AbstractScrapeHandler {

    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        super(scrapeConfigDataInterface);
    }

    protected async scrape(scrapeInfo: ScrapeListInfo) {
        let page;
        try {
            const disableSec = this.configData.getDisableSec();
            const url = this.configData.getUrl();
            const loadSelector = this.configData.getLoadSelector();
            const name = this.configData.getName();

            console.log('puppeteer start list scraping: ' + name);

            page = await this.browser.newPage();
            
            // Optimize for Lambda environment
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1366, height: 768 });
            
            // Disable unnecessary features for faster loading
            await page.setJavaScriptEnabled(true);
            await page.setCacheEnabled(false);

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

            const searchUrl = this.constructUri(scrapeInfo.query || '', url);
            console.log("scraping address: " + searchUrl);

            // Set a reasonable timeout for Lambda environment (2-3 minutes max)
            const navigationTimeout = this.configData.getLoadTimeout() || 12000; // 2 minutes
            const waitUntil = this.configData.getLoadWaitUntil() || 'domcontentloaded'; 
            await page.goto(searchUrl, {
                waitUntil: waitUntil,
                timeout: navigationTimeout
            });
            
            if (loadSelector !== undefined && loadSelector !== null) {
                console.log('waiting for: ' + loadSelector);
                await page.waitForSelector(loadSelector, { timeout: 30000 }); // 30 second timeout for selector
            }

            const html = await page.content();

            return html;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`SCRAPE_ERROR: failed scraping: ${errorMessage}`);
        } finally {
            // Ensure page is closed even if an error occurs
            if (page) {
                try {
                    await page.close();
                } catch (closeError) {
                    console.warn('Error closing page:', closeError);
                }
            }
        }
    }
}
import {ScraperInterface} from "../interfaces/ScraperInterface.ts";
import {ScrapeConfigDataInterface} from "../interfaces/ScrapeConfig.ts";
import puppeteerCore from "puppeteer-core";
import process from "node:process";
import {getSecretValue} from "../../../commons/utils/SecretManager.ts";

const chromium = require("@sparticuz/chromium");
const brightDataServices: string[] = process.env.BRIGHT_DATA_SERVICE_ENABLED_LIST?.split(',') ?? [];

class AbstractScrapeHandler {

    protected constructUri(query: string, uri: string | null): string {
        if (uri == null)
            return '';

        const searchUrl = uri.replace('{query}', query);
        console.log('searchUrl ' + searchUrl);

        return searchUrl;
    }
}

export class PuppeteerScrapeService extends AbstractScrapeHandler implements ScraperInterface {
    protected configData: ScrapeConfigDataInterface;
    protected browser: any;

    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        super();
        this.configData = scrapeConfigDataInterface;
    }

    public async start(query: string, userId: string, scraperRequestInfo: any): Promise<any> {
        try {
            await this.startBrowser(scraperRequestInfo);
            const htmlResult = await this.scrape(query);

            return htmlResult;
        } catch (error) {
            console.error('Error starting PuppeteerScrapeListService:', error);
            this.closeBrowser();
            throw error;
        } finally {
            this.closeBrowser();
        }
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

            const blockedResources = ['image', 'media', 'font'];
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

            await page.goto(searchUrl, {waitUntil: 'networkidle2', timeout: 20 * 60 * 1000});
            // await page.goto(searchUrl, {waitUntil: 'domcontentloaded', timeout: 20 * 60 * 1000});
            if (loadSelector == undefined || loadSelector === null) {
                console.log('waiting for: ' + loadSelector);
                await page.waitForSelector(loadSelector);
            }

            const html = await page.content();

            return html;
        } catch (error) {
            throw new Error('Scrape process failed, error: ' + error);
        }
    }

    public async startBrowser(scraperInfo: any): Promise<void> {
        console.log(`starting browser. on stage: ${process.env.STAGE}`);
        if (brightDataServices.indexOf(scraperInfo.name) > -1) {
            console.log("with BrightData service...");
            const brightDataWsEndpoint = await this.getBrightDataKey();

            this.browser = await puppeteerCore.connect({
                browserWSEndpoint: brightDataWsEndpoint,
            });
        } else if (process.env.STAGE === 'prod') {
            console.log("using installed chromium...")
            this.browser = await puppeteerCore.launch({
                args: [
                    ...chromium.args,
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--allow-running-insecure-content',
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(
                    'https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar',
                ),
                headless: chromium.headless,
            });
        } else {
            this.browser = await puppeteerCore.launch({
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                args: scraperInfo.disableSec ? [
                    '--disable-web-security',
                ] : [],
                headless: false
            });
        }
        console.log("browser started...");
    }
    protected async getBrightDataKey(): Promise<string> {
        const adrrs = process.env.SECRET_MANAGER_ADDRESS || '';
        const secrets = await getSecretValue(adrrs);
        const SECRET_MANAGER_KEY: string = process.env.SECRET_MANAGER_KEY || '';
        console.log("My Secret:", secrets[SECRET_MANAGER_KEY]);
        return secrets[SECRET_MANAGER_KEY];
    }

    protected async closeBrowser(): Promise<void> {
        if (this.browser) {
            try {
                console.log("Closing browser...");
                await this.browser.close();
                console.log("Browser closed.");
            } catch (error) {
                console.error("Error while closing browser:", error);
            } finally {
                this.browser = null;
            }
        }
    }
}
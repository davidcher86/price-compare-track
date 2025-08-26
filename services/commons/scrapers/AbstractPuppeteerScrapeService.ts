import puppeteerCore from "puppeteer-core";
import {ScraperInterface} from "./interfaces/ScraperInterface";
import {getSecretValue} from "../utils/SecretManager";
import {ScrapeConfigDataInterface} from "./interfaces/ScrapeConfig";

const chromium = require("@sparticuz/chromium");

const brightDataServices: string[] = process.env.BRIGHT_DATA_SERVICE_ENABLED_LIST?.split(',') ?? [];

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
    href?: string;
    name?: string;
    query?: string;
}

export abstract class AbstractScrapeHandler implements ScraperInterface {
    protected browser: any;
    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigDataInterface: ScrapeConfigDataInterface) {
        // super();
        this.configData = scrapeConfigDataInterface;
    }

    public async start(scraperRequestInfo: any): Promise<any> {
        try {
            await this.startBrowser(scraperRequestInfo);
            const htmlResult = await this.scrape(scraperRequestInfo.query);

            return htmlResult;
        } catch (error) {
            console.error('Error starting PuppeteerScrapeListService:', error);
            this.closeBrowser();
            throw error;
        } finally {
            this.closeBrowser();
        }
    }

    protected abstract scrape(scrapeInfo: ScrapeInfo): Promise<any>;

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

    protected constructUri(query: string, uri: string | null): string {
        if (uri == null)
            return '';

        const searchUrl = uri.replace('{query}', query);
        console.log('searchUrl ' + searchUrl);

        return searchUrl;
    }

    protected async getBrightDataKey(): Promise<string> {
        const adrrs = process.env.SECRET_MANAGER_ADDRESS || '';
        const secrets = await getSecretValue(adrrs);
        const SECRET_MANAGER_KEY: string = process.env.SECRET_MANAGER_KEY || '';
        return secrets[SECRET_MANAGER_KEY];
    }

    protected async startBrowser(scraperInfo: any): Promise<void> {
        if (brightDataServices.indexOf((scraperInfo.name.toLowerCase())) > -1) {
            console.log(`starting browser. with BrightData service...`);
            const brightDataWsEndpoint = await this.getBrightDataKey();

            this.browser = await puppeteerCore.connect({
                browserWSEndpoint: brightDataWsEndpoint,
            });
        } else if (process.env.STAGE === 'prod') {
            console.log(`starting browser. using installed chromium...`)
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
}
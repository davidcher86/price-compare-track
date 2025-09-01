import * as cheerio from "cheerio";
import {ExtractDataInterface} from "../../../../../commons/scrapers/interfaces/ExtractDataInterface";
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class SimpleSingleItemExtractData implements ExtractDataInterface {

    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        this.configData = scrapeConfigReader;
    }

    public async extract(html: any, query: string): Promise<any> {
        // let items: any[] = [];
        const extractArgs = this.configData.getExtractArgs();
        const hrefHost = this.configData.getHrefHost() || '';
        const listIdentifier = this.configData.getListIdentifier() || '';
        const singleItemPageWrapper = this.configData.getSingleItemPageWrapper() || '';
        const singleItemPagePriceSelector = this.configData.getSingleItemPagePriceSelector() || '';
        const singleItemPageImageSelector = this.configData.getSingleItemPageImageSelector() || '';
        const singleItemPageNameSelector = this.configData.getSingleItemPageNameSelector() || '';

        if (extractArgs === undefined || extractArgs.length === 0 || listIdentifier === '') {
            throw {status: "EXTRACRD_DATA_DATA_VALIDATION_ERROR",message: `no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`};
        //    throw new Error("extractArgs/listIdentifier is undefined or empty");
        }

        const $ = cheerio.load(html);
        const singleItemWrapperElement = $(singleItemPageWrapper);
        
        const image = this.extractImgttr($, singleItemWrapperElement, singleItemPageImageSelector);
        const price = this.extractPrice($, singleItemWrapperElement, singleItemPagePriceSelector);
        const productName = this.extractName($, singleItemWrapperElement, singleItemPageNameSelector);

        return [{
            image: image,
            price: price,
            name: productName
        }]
    }

    protected isRecordValid(dynamicObject: any): boolean {
        return (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined)
    }

    protected extractHref($: cheerio.CheerioAPI, element: any, selector: string) {
        const href = $(element).find(selector).attr('href');
       if ($(element).find(selector).attr('href') != undefined) {
            const href = $(element).find(selector).attr('href');
            return href || null;
        }
        return null;
    }

    protected extractImgttr($: cheerio.CheerioAPI, element: any, selector: string) {
        const image = $(element).find(selector).attr('src');
        console.log($(element).html());
        if ($(element).find(selector).attr('src') != undefined) {
            const img = $(element).find(selector).attr('src');
            return img || null;
        }
        return null;
    }

    protected extractName($: cheerio.CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element)?.find(selector)?.text()?.trim() || null;

        return null;
    }

    protected extractPrice($: cheerio.CheerioAPI, element: any, selector: string) {
        const price = $(element)?.find(selector)?.text()?.trim();
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element).find(selector).first().text().trim() || null;

        return null;
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}
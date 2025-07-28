import * as cheerio from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData.ts";
import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";

export class EbayExtractData extends SimpleExtractData {
    protected configData: any;

    constructor(scrapeConfigReader: ScrapeConfigReader) {
        super(scrapeConfigReader)
    }

    protected isRecordValid(dynamicObject: any): boolean {
        return (Object.keys(dynamicObject).length > 0 
                && dynamicObject.name !== undefined 
                && dynamicObject.price !== undefined
                && !dynamicObject.name?.toLowerCase().includes("shop on ebay"));
    }

    protected extractHref($: cheerio.CheerioAPI, element: any, selector: any, hrefHost: string): string | null {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
            return ($(element)?.find(selector)?.first()?.attr('href') || null);
        }

        return null;
    }
}
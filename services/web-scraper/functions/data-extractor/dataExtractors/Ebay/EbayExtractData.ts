import {CheerioAPI} from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData";
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class EbayExtractData extends SimpleExtractData {
    protected configData: any;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader)
    }

    protected isRecordValid(dynamicObject: any): boolean {
        // console.log('dynamicObject: ' + dynamicObject.saveExtractedBucketName);
        // console.log(!dynamicObject.name?.toLowerCase().includes("shop on ebay"));
        return (Object.keys(dynamicObject).length > 0 
                && dynamicObject.name !== undefined 
                && dynamicObject.price !== undefined
                && !dynamicObject.name?.toLowerCase().includes("shop on ebay"));
    }

    protected extractHref($: CheerioAPI, element: any, selector: any, hrefHost: string): string | null {
        const href = $(element)?.find(selector)?.first()?.attr('href');
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
            return ($(element)?.find(selector)?.first()?.attr('href') || null);
        }

        return null;
    }

    protected extractImgttr($: CheerioAPI, element: any, selector: string, dynamicObject: any) {
        // const image = $(element).find(selector).attr('src');
        if ($(element).find(selector).attr('src') != undefined) {
            const img = $(element).find(selector).attr('src');
            return img || null;
        }
        return null;
    }

    protected extractPrice($: CheerioAPI, element: any, selector: string) {
        const price = $(element)?.find(selector)?.text()?.trim();
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element).find(selector).text().trim() || null;

        return null;
    }
}
import * as cheerio from "cheerio";
import {SimpleSingleItemExtractData} from "../SimpleSingleItemExtractData";
import {ScrapeConfigDataInterface} from "../../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class NewEggExtractData extends SimpleSingleItemExtractData {

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader);
    }

    // protected extractHref($: cheerio.CheerioAPI, element: any, selector: any, hrefHost: string): string | null {
    //     if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
    //         const href = hrefHost + ($(element)?.find(selector)?.first()?.attr('href') || null);
    //         return href;
    //     }
        
    //     return null;
    // }

    // protected extractPrice($: cheerio.CheerioAPI, element: any, selector: string) {
    //     if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined){
    //         const price = $(element).find(selector).first().text();
    //         const cleanPrice = price.replace(/[\u00A0–-]/g, '').trim();
    //         return cleanPrice
    //     }

    //     return null;
    // }
}
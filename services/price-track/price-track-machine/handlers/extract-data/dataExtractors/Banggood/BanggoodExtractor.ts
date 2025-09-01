import {CheerioAPI} from "cheerio";
import {SimpleSingleItemExtractData} from "../SimpleSingleItemExtractData";
import {ScrapeConfigDataInterface} from "../../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class BanggoodExtractData extends SimpleSingleItemExtractData {

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader)
    }

    protected extractHref($: CheerioAPI, element: any, selector: string) {
        const container = $(element);

        let href = container.find(selector).first().attr('link');
        return href || null;
    }
    
        protected extractName($: CheerioAPI, element: any, selector: string) {
            if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
                return $(element)?.find(selector)?.first().text().trim() || null;
    
            return null;
        }
        
        protected extractPrice($: CheerioAPI, element: any, selector: string) {
            const price = $(element)?.find(selector)?.text()?.trim();
            if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
                return $(element).find(selector).last().text().trim() || null;
    
            return null;
        }
        
        protected extractImgttr($: CheerioAPI, element: any, selector: string) {
            const image = $(element).find(selector).attr('src');
            console.log($(element).html());
            if ($(element).find(selector).attr('src') != undefined) {
                const img = $(element).find(selector).attr('src');
                return img || null;
            }
            return null;
        }
}
import {CheerioAPI} from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData";
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class BanggoodExtractData extends SimpleExtractData {

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader)
    }

    protected extractHref($: CheerioAPI, element: any, selector: string, dynamicObject: any) {
        const container = $(element);

        let href = container.find(selector).first().attr('link');
        return href || null;
    }
}
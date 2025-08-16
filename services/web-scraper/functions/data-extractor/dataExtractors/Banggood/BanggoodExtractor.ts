import {CheerioAPI} from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData.ts";
import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";

export class BanggoodExtractData extends SimpleExtractData {

    constructor(scrapeConfigReader: ScrapeConfigReader) {
        super(scrapeConfigReader)
    }

    protected extractHref($: CheerioAPI, element: any, selector: string, dynamicObject: any) {
        const container = $(element);

        let href = container.find(selector).first().attr('link');
        return href || null;
    }
}
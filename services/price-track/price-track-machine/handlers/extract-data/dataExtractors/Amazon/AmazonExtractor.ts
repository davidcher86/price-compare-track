import {CheerioAPI} from "cheerio";
import {SimpleSingleItemExtractData} from "../SimpleSingleItemExtractData";
import {ScrapeConfigDataInterface} from "../../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class AmazonExtractData extends SimpleSingleItemExtractData {
    protected configData: any;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader)
    }

    protected extractName($: CheerioAPI, element: any, selector: string) {
        const container = $(element);

        // Title: primary source
        let title: string | undefined = container.find('h2 a span').text().trim();

        // Fallback: span.a-text-normal or img alt
        if (!title) {
            title = container.find(selector).text().trim()
                || container.find('span.a-text-normal').text().trim()
                || container.find('img.s-image').attr('alt')?.trim();
        }

        return title || null;
    }

    protected extractImage($: CheerioAPI, element: any, selector: string) {
        // const image =q $(element).find(selector).first().attr('src');
        const container = $(element);
        
        if ($(element).find(selector).first() != undefined) {
            const img = container.find(selector);
            const imageUrl = img.attr('src') || img.attr('data-src') || null;

            // const img = 'http:' + $(element).find(selector).first().attr('src');
            return imageUrl || null;
        }
        return null;
    }
    
    protected extractPrice($: CheerioAPI, element: any, selector: string) {
        const container = $(element);
        
        if (container.find(selector).first().text().trim() !== undefined)
            return container.find(selector).first().text().trim();

        return null;
    }
    
    protected extractHref($: CheerioAPI, element: any, selector: string) {
        const container = $(element);
        
        if (container.find(selector).first().text().trim() !== undefined)
            return container.find(selector).first().attr('href') || null;

        return null;
    }
}
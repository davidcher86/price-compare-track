import {CheerioAPI} from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData";
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class AmazonExtractData extends SimpleExtractData {
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

    protected extractImage($: CheerioAPI, element: any, selector: string, dynamicObject: any) {
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
    
    protected extractHref($: CheerioAPI, element: any, selector: string, dynamicObject: any) {
        const container = $(element);
        
        let href = container.find(selector)
                      .map((_, a) => $(a).attr('href'))
                      .toArray()
                      .find(href => href?.includes('/dp/') || href?.includes('/gp/'));


        return href || null;
    }
}
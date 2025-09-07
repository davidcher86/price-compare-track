import {CheerioAPI} from "cheerio";
import {SimpleSingleItemExtractData} from "../SimpleSingleItemExtractData";
import {ScrapeConfigDataInterface} from "../../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class AliExpressExtractData extends SimpleSingleItemExtractData {
    protected configData: any;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        super(scrapeConfigReader)
    }

    // protected extractPrice($: CheerioAPI, element: any) {
    //     let priceText = '';

    //     $(element)
    //         .find('span')
    //         .each((_: any, span: any) => {
    //             const fullText = $(span).text().replace(/\s+/g, ' ').trim();

    //             if (/(\$|₪)/.test(fullText) && priceText === '') {
    //                 priceText = $(span).parent().text().replace(/\s+/g, ' ').replace(/[a-zA-Z]/g, '').trim();
    //             }
    //         });

    //     return priceText;
    // }

    protected extractName($: CheerioAPI, element: any, selector: string) {
        const image = $(element).find(selector).attr('title');
      
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element)?.find(selector)?.attr('title') || null;

        return null;
    }

    // protected extractHref($: CheerioAPI, element: any, selector: any, hrefHost: string): string | null {
    //     const image = $(element).find(selector).attr('href');
    //     if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
    //         const href = 'http:' + ($(element)?.find(selector)?.first()?.attr('href') || null);
    //         return href;
    //     }
    //     return null;
    // }

    protected extractImgttr($: CheerioAPI, element: any, selector: string) {
        const image = $(element).find(selector).first().attr('src');
        if ($(element).find(selector).first() != undefined) {
            const img = 'http:' + $(element).find(selector).first().attr('src');
            return img || null;
        }
        return null;
    }
}
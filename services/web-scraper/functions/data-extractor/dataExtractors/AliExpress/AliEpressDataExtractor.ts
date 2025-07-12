import {CheerioAPI} from "cheerio";
import {SimpleExtractData} from "../SimpleExtractData.ts";
import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";

export class AliExpressExtractData extends SimpleExtractData {
    protected configData: any;

    constructor(scrapeConfigReader: ScrapeConfigReader) {
        super(scrapeConfigReader)
    }

    protected extractPrice($: CheerioAPI, element: any) {
        let priceText = '';

        $(element)
            .find('span')
            .each((_: any, span: any) => {
                const fullText = $(span).text().replace(/\s+/g, ' ').trim();

                if (/(\$|₪)/.test(fullText) && priceText === '') {
                    priceText = $(span).parent().text().replace(/\s+/g, ' ').trim();
                }
            });

        return priceText;
    }
}
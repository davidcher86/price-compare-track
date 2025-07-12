import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";
import {ExtractDataInterface} from "../interfaces/ExtractDataInterface";
import {ScrapeConfigDataInterface} from "../interfaces/ScrapeConfig";

export class SimpleExtractData implements ExtractDataInterface {

    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        this.configData = scrapeConfigReader;
    }

    public async extract(html: any, userId: string): Promise<any[]> {
        const $ = cheerio.load(html);

        let items: any[] = [];
        const extractArgs = this.configData.getExtractArgs();
        const listIdentifier = this.configData.getListIdentifier();
        const divWithTooltip = listIdentifier ? $(listIdentifier) : undefined;

        if (divWithTooltip == null || divWithTooltip.length === 0)
            return items;

        const childElements = divWithTooltip.find('*');

        console.log("childElements found: " + childElements.length);
        childElements.each((_, element) => {
            try {
                let dynamicObject: any = {};
                for (const arg of extractArgs) {
                    // console.log('arg:', JSON.stringify(arg));
                    let selector = arg.selector;
                    let key = arg.keyName;
                    let type = arg.type;
                    let value: string | null = '';

                    switch (type) {
                        case 'src':
                            value = this.extractSrcAttr($, element, selector);
                            break;
                        case 'price':
                            value = this.extractPrice($, element, selector);
                            break;
                        case 'text':
                        default:
                            value = this.extractText($, element, selector);
                            break;
                    }

                    if (value !== null && value !== undefined && value !== '') {
                        dynamicObject[key] = value;
                    }
                }

                if (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined
                    && dynamicObject.name !== null && dynamicObject.price !== null) {
                    items.push(dynamicObject);
                }
            } catch (error) {
                console.error('Error processing element:', error);
            }
        });

        console.log(`extracted ${items.length} items from the page`);
        return items;
    }

    protected extractSrcAttr($: CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element)?.find(selector)?.first()?.attr('src') || null;

        return null;
    }

    protected extractText($: CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element)?.find(selector)?.text()?.trim() || null;

        return null;
    }

    protected extractPrice($: CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element).find(selector).first().text().trim() || null;

        return null;
    }
}
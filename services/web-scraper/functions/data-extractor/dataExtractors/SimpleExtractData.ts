import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";
import {ExtractDataInterface} from "../interfaces/ExtractDataInterface.ts";
import {ScrapeConfigDataInterface} from "../interfaces/ScrapeConfig.ts";
import { AnyNode } from "node_modules/domhandler/lib/esm/node.js";

const items: {
    title: string;
    price: string;
    image: string;
    link: string;
}[] = [];

export class SimpleExtractData implements ExtractDataInterface {

    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        this.configData = scrapeConfigReader;
    }

    public async extract(html: any, userId: string): Promise<any[]> {
        const $ = cheerio.load(html);

        let items: any[] = [];
        const extractArgs = this.configData.getExtractArgs();
        const hrefHost = this.configData.getHrefHost() || '';
        const listIdentifier = this.configData.getListIdentifier() || '';
        // const divWithTooltip = listIdentifier ? $(listIdentifier) : undefined;

        // if (divWithTooltip == null || divWithTooltip.length === 0)
        //     return items;

        // const childElements = divWithTooltip.find('*');
        const childElements = $(listIdentifier);

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
                        case 'href':
                            value = this.extractHref($, element, selector, hrefHost);
                            break;
                        case 'img':
                            value = this.extractImgttr($, element, selector, dynamicObject);
                            break;
                        case 'price':
                            value = this.extractPrice($, element, selector);
                            break;
                        case 'text':
                        default:
                            value = this.extractName($, element, selector);
                            break;
                    }

                    if (value !== null && value !== undefined && value !== '') {
                        dynamicObject[key] = value;
                    }
                }
                if (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined) {
                        items.push(dynamicObject);
                }
            } catch (error) {
                console.error('Error processing element:', error);
            }
        });

        console.log(`extracted ${items.length} items from the page`);
        return items;
    }

    protected extractHref($: cheerio.CheerioAPI, element: AnyNode, selector: any, hrefHost: string): string | null {
        const image = $(element).find(selector).attr('href');
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
            const href = hrefHost + ($(element)?.find(selector)?.first()?.attr('href') || null);
            return href;
        }
        return null;
    }

    protected extractImgttr($: CheerioAPI, element: AnyNode, selector: string, dynamicObject: any) {
        const image = $(element).find(selector).attr('src');
       if ($(element).find(selector).attr('src') != undefined) {
            const img = $(element).find(selector).attr('src');
            return img || null;
        }
        return null;
    }

    protected extractName($: CheerioAPI, element: AnyNode, selector: string) {
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
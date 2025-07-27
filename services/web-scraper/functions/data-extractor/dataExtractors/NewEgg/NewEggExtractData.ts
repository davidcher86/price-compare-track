import * as cheerio from "cheerio";
import {ExtractDataInterface} from "../../interfaces/ExtractDataInterface.ts";
import {AliExpressScrapeConfigReader} from "../AliExpress/AliExpressScrapeConfigReader.ts";
import {NewEggScrapeConfigReader} from "./NewEggScrapeConfigReader.ts";
import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";
import {SimpleExtractData} from "../SimpleExtractData.ts";
// import { AnyNode } from "domhandler"; // Adjust the import path as necessary

export class NewEggExtractData extends SimpleExtractData {

    constructor(scrapeConfigReader: ScrapeConfigReader) {
        super(scrapeConfigReader);
    }

//     public async extract(html: any, scraperInfo: any) {
//         const $ = cheerio.load(html);

//         let items: any[] = [];
//         const ll = $(scraperInfo.scrapeArgs.listIdentifier);

//         const divWithTooltip = $(scraperInfo.scrapeArgs.loadSelector);

// // Get all child elements under the selected <div>
//         const childElements = divWithTooltip.find('*');

//         childElements.each((_, element) => {
//             try {
//                 let dynamicObject: any = {};
//                 for (const arg of scraperInfo.scrapeArgs.extractArgs) {
//                     console.log('arg:', JSON.stringify(arg));
//                     let selector = arg.selector;
//                     let key = arg.keyName;
//                     let type = arg.type;
//                     let value: string | null = '';

//                     switch (type) {
//                         case 'src':
//                             console.log("src searching for selector: " + selector);
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element)?.find(selector)?.first()?.attr('src') || null;
//                             break;
//                         case 'price':
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element).find(selector).first().text().trim() || null;

//                             // value = this.findPrice($, element);
//                             break;
//                         case 'text':
//                         default:
//                             console.log("text searching for selector: " + selector);
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element)?.find(selector)?.text()?.trim() || null;
//                             break;
//                     }

//                     if (value !== null && value !== undefined && value !== '') {
//                         dynamicObject[key] = value;
//                         console.log(`key: ${key}, value: ${value}`);
//                     }
//                 }

//                 if (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined) {
//                     items.push(dynamicObject);
//                 }
//             } catch (error) {
//                 console.error('Error processing element:', error);
//             }
//         });

//         return items;
//     }

    protected extractHref($: cheerio.CheerioAPI, element: any, selector: any, hrefHost: string): string | null {
        const image = $(element).find(selector).attr('href');
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined) {
            const href = hrefHost + ($(element)?.find(selector)?.first()?.attr('href') || null);
            return href;
        }
        return null;
    }

    protected extractPrice($: cheerio.CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined){
            const price = $(element).find(selector).first().text();
            const cleanPrice = price.replace(/[\u00A0–-]/g, '').trim();
            return cleanPrice
        }
        return null;
    }
}
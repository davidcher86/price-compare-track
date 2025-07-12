import * as cheerio from "cheerio";
import {ExtractDataInterface} from "../../interfaces/ExtractDataInterface";
import {AliExpressScrapeConfigReader} from "../AliExpress/AliExpressScrapeConfigReader";
import {NewEggScrapeConfigReader} from "./NewEggScrapeConfigReader";
import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader";
import {SimpleExtractData} from "../SimpleExtractData";

// export class NewEggExtractData extends SimpleExtractData {
//
//     constructor(scrapeConfigReader: ScrapeConfigReader) {
//         super(scrapeConfigReader);
//     }

//     public async extract(html: any, scraperInfo: any) {
//         const $ = cheerio.load(html);
//
//         let items: any[] = [];
//         const ll = $(scraperInfo.scrapeArgs.listIdentifier);
//
//         const divWithTooltip = $(scraperInfo.scrapeArgs.loadSelector);
//
// // Get all child elements under the selected <div>
//         const childElements = divWithTooltip.find('*');
//
//         childElements.each((_, element) => {
//             try {
//                 let dynamicObject: any = {};
//                 for (const arg of scraperInfo.scrapeArgs.extractArgs) {
//                     console.log('arg:', JSON.stringify(arg));
//                     let selector = arg.selector;
//                     let key = arg.keyName;
//                     let type = arg.type;
//                     let value: string | null = '';
//
//                     switch (type) {
//                         case 'src':
//                             console.log("src searching for selector: " + selector);
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element)?.find(selector)?.first()?.attr('src') || null;
//                             break;
//                         case 'price':
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element).find(selector).first().text().trim() || null;
//
//                             // value = this.findPrice($, element);
//                             break;
//                         case 'text':
//                         default:
//                             console.log("text searching for selector: " + selector);
//                             if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
//                                 value = $(element)?.find(selector)?.text()?.trim() || null;
//                             break;
//                     }
//
//                     if (value !== null && value !== undefined && value !== '') {
//                         dynamicObject[key] = value;
//                         console.log(`key: ${key}, value: ${value}`);
//                     }
//                 }
//
//                 if (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined) {
//                     items.push(dynamicObject);
//                 }
//             } catch (error) {
//                 console.error('Error processing element:', error);
//             }
//         });
//
//         return items;
//     }
//
//     protected findPrice($: any, element: any) {
//         return $(element).find('.a-price').each((_: any, el: any) => {
//             const priceText = $(el).find('.a-offscreen').first().text().trim();
//             console.log('Price:', priceText);
//             return priceText;
//         });
//     }
// }
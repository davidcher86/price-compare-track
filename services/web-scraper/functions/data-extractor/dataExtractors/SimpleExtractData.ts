import * as cheerio from "cheerio";
import {ExtractDataInterface} from "../interfaces/ExtractDataInterface.ts";
import {ScrapeConfigDataInterface} from "../interfaces/ScrapeConfig.ts";
import {sendMessageToQueue, getDlqSqsName, generateDlqSqsPayload} from "../../../commons/utils/SQSService.ts";

export class SimpleExtractData implements ExtractDataInterface {

    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        this.configData = scrapeConfigReader;
    }

    public async extract(html: any, query: string): Promise<any[]> {
        let items: any[] = [];
        const extractArgs = this.configData.getExtractArgs();
        const hrefHost = this.configData.getHrefHost() || '';
        const listIdentifier = this.configData.getListIdentifier() || '';

        if (extractArgs === undefined || extractArgs.length === 0 || listIdentifier === '') {
            throw {status: "EXTRACRD_DATA_DATA_VALIDATION_ERROR",message: `no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`};
        //    throw new Error("extractArgs/listIdentifier is undefined or empty");
        }

        const $ = cheerio.load(html);
        const childElements = $(listIdentifier);

        // console.log(html);
        if (childElements.length === 0) {
            throw {status: "EXTRACRD_DATA_NO_CHILD_ELEMENTS",message: `no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`};
            
            // throw new Error(`childElements are empty, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`);
            // await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload({}, "childElements are empty"));
            // return [];
            // throw new Error("childElements are empty");
        }

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
                
                if (this.isRecordValid(dynamicObject)) {
                    items.push(dynamicObject);
                }
            } catch (error) {
                throw {status: "EXTRACRD_DATA_DATA_VALIDATION_ERROR",message: `Error processing element: ${error} elements. [query: ${query}, source: ${this.configData.getName()}]`};

                // console.error('Error processing element:', error);
            }
        });

        console.log(`extracted ${items.length} items from the page`);
        if (childElements.length === 0) 
            throw {status: "EXTRACRD_DATA_NO_RESULTS_ERROR",message: `no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`};
            // throw new Error(`no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`);
            // await sendMessageToQueue(getDlqSqsName(),generateDlqSqsPayload(event, "no resylts where found"));
        
        return items;
    }

    protected isRecordValid(dynamicObject: any): boolean {
        return (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined)
    }

    protected extractHref($: cheerio.CheerioAPI, element: any, selector: string, dynamicObject: any) {
        const href = $(element).find(selector).attr('href');
       if ($(element).find(selector).attr('href') != undefined) {
            const href = $(element).find(selector).attr('href');
            return href || null;
        }
        return null;
    }

    protected extractImgttr($: cheerio.CheerioAPI, element: any, selector: string, dynamicObject: any) {
        const image = $(element).find(selector).attr('src');
       if ($(element).find(selector).attr('src') != undefined) {
            const img = $(element).find(selector).attr('src');
            return img || null;
        }
        return null;
    }

    protected extractName($: cheerio.CheerioAPI, element: any, selector: string) {
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element)?.find(selector)?.text()?.trim() || null;

        return null;
    }

    protected extractPrice($: cheerio.CheerioAPI, element: any, selector: string) {
        const price = $(element)?.find(selector)?.text()?.trim();
        if ($(element)?.find(selector) !== null && $(element)?.find(selector) !== undefined)
            return $(element).find(selector).first().text().trim() || null;

        return null;
    }
}

interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}
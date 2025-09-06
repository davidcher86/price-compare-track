import * as cheerio from "cheerio";
import {ExtractDataInterface} from "../../../../../commons/scrapers/interfaces/ExtractDataInterface";
import {ScrapeConfigDataInterface} from "../../../../../commons/scrapers/interfaces/ScrapeConfig";

export class SimpleSingleItemExtractData implements ExtractDataInterface {

    protected configData: ScrapeConfigDataInterface;

    constructor(scrapeConfigReader: ScrapeConfigDataInterface) {
        this.configData = scrapeConfigReader;
    }

    public async extract(html: any, query: string): Promise<any> {

        const extractArgs = this.configData.getExtractArgs();
        const listIdentifier = this.configData.getListIdentifier() || '';
        const singleItemPageWrapper = this.configData.getSingleItemPageWrapper() || '';
        const singleItemPagePriceSelector = this.configData.getSingleItemPagePriceSelector() || '';

        if (extractArgs === undefined || extractArgs.length === 0 || listIdentifier === '') {
            throw {status: "EXTRACRD_DATA_DATA_VALIDATION_ERROR",message: `no results where found, when searching for ${listIdentifier} elements. [query: ${query}, source: ${this.configData.getName()}]`};
        }

        const $ = cheerio.load(html);
        const singleItemWrapperElement = $(singleItemPageWrapper);
        const price = this.extractPrice($, singleItemWrapperElement, singleItemPagePriceSelector);
       
        if (price === null) {
            throw new Error('Price not found');
        }
        
        const parsedPrice = this.parsePrice(price);
        
        return [{
            price: parsedPrice
        }]
    }

    protected isRecordValid(dynamicObject: any): boolean {
        return (Object.keys(dynamicObject).length > 0 && dynamicObject.name !== undefined && dynamicObject.price !== undefined)
    }

    protected extractHref($: cheerio.CheerioAPI, element: any, selector: string) {
        const href = $(element).find(selector).attr('href');
       if ($(element).find(selector).attr('href') != undefined) {
            const href = $(element).find(selector).attr('href');
            return href || null;
        }
        return null;
    }

    protected extractImage($: cheerio.CheerioAPI, element: any, selector: string) {
        const image = $(element).find(selector).attr('src');
        console.log($(element).html());
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

    protected parsePrice(priceString: string): number {
        // Remove currency symbols and spaces, but keep digits, dots, and commas
        const cleaned = priceString.replace(/[^\d.,]/g, '');
        
        // Handle European format (comma as decimal separator)
        // Pattern: digits, optional comma/dot for thousands, comma for decimal
        const europeanPattern = /^(\d{1,3}(?:[.,]\d{3})*),(\d{2})$/;
        const europeanMatch = europeanPattern.exec(cleaned);
        
        if (europeanMatch) {
            // Convert European format: remove thousands separators, replace comma with dot
            const wholePart = europeanMatch[1].replace(/[.,]/g, '');
            const decimalPart = europeanMatch[2];
            const normalized = `${wholePart}.${decimalPart}`;
            return parseFloat(normalized);
        }
        
        // Handle US format (dot as decimal separator)
        // Pattern: digits, optional comma for thousands, dot for decimal
        const usPattern = /^(\d{1,3}(?:,\d{3})*)\.(\d{2})$/;
        const usMatch = usPattern.exec(cleaned);
        
        if (usMatch) {
            // Convert US format: remove thousands separators
            const wholePart = usMatch[1].replace(/,/g, '');
            const decimalPart = usMatch[2];
            const normalized = `${wholePart}.${decimalPart}`;
            return parseFloat(normalized);
        }
        
        // Simple fallback: just extract first number sequence
        const simplePattern = /(\d+)[.,](\d+)/;
        const simpleMatch = simplePattern.exec(cleaned);
        
        if (simpleMatch) {
            return parseFloat(`${simpleMatch[1]}.${simpleMatch[2]}`);
        }
        
        // Last resort: try to parse as-is after basic cleaning
        const basicCleaned = cleaned.replace(/,/g, '.');
        const parsed = parseFloat(basicCleaned);
        
        if (isNaN(parsed)) {
            throw new Error(`Invalid price format: ${priceString}`);
        }

        return parsed;
    }
}




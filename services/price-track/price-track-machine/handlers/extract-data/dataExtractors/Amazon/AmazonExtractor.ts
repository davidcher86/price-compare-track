import {CheerioAPI} from "cheerio";
import {SimpleSingleItemExtractData} from "../SimpleSingleItemExtractData";
import {ScrapeConfigDataInterface} from "../../../../../../commons/scrapers/interfaces/ScrapeConfig";
import {ExtractDataInterface} from "../../../../../../commons/scrapers/interfaces/ExtractDataInterface";

export class AmazonExtractData extends SimpleSingleItemExtractData implements ExtractDataInterface {
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
        const container = $(element);
        
        console.log('=== IMAGE EXTRACTION DEBUG ===');
        console.log('Selector used:', selector);
        console.log('Container HTML preview:', container.html()?.substring(0, 200) + '...');
        
        // Find the image element using the selector
        const imageElement = container.find(selector).first();
        
        console.log('Image element found:', imageElement.length > 0);
        
        if (imageElement.length > 0) {
            console.log('Image element HTML:', (imageElement.get(0) as any)?.outerHTML);
            
            // Debug each attribute individually
            const srcAttr = imageElement.attr('src');
            const dataSrcAttr = imageElement.attr('data-src');
            const dataOldHiresAttr = imageElement.attr('data-old-hires');
            const dataAHiresAttr = imageElement.attr('data-a-hires');
            
            // console.log('src attribute:', srcAttr);
            // console.log('data-src attribute:', dataSrcAttr);
            // console.log('data-old-hires attribute:', dataOldHiresAttr);
            // console.log('data-a-hires attribute:', dataAHiresAttr);
            
            // Try multiple src attributes that Amazon commonly uses
            const imageUrl = srcAttr || dataSrcAttr || dataOldHiresAttr || dataAHiresAttr;
            
            // console.log('Final extracted image URL:', imageUrl);
            // console.log('=== END IMAGE EXTRACTION DEBUG ===');
            return imageUrl || null;
        }
        
        console.log('No image element found with selector:', selector);
        console.log('Available img elements in container:', container.find('img').length);
        console.log('=== END IMAGE EXTRACTION DEBUG ===');
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
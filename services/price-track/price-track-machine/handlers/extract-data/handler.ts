import * as cheerio from 'cheerio';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

interface ExtractedData {
    scrapeInfo: any;
    userId: string;
    priceTrackData?: null;
}

interface ScrapeInfo {
    id: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href: string;
    name?: string;
    bucketName: string;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
}

interface ExtractedDataEvent {
    scrapeInfo?: ScrapeInfo;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
}

export const extractData = async (extractDataEvent: ExtractedDataEvent): Promise<ExtractedData> => {
    try {
        console.log('ExtractDataEvent:', JSON.stringify(extractDataEvent));
        //     const { bucketKey, bucketName, userId, scrapeInfo } = extractDataEvent;

        //     console.log('event:', JSON.stringify(event));
        //     const s3Object = await s3
        //         .getObject({
        //             Bucket: bucketName,
        //             Key: bucketKey,
        //         })
        //         .promise();

        //     const html = s3Object.Body?.toString('utf-8') || '';

        //     if (html.length === 0) {
        //         throw new Error('HTML content is empty');
        //     }

        //     const $ = cheerio.load(html);
        //     let dynamicObject: any = {};
        //     for (const arg of scrapeInfo.scrapeArgs.extractArgs) {
        //         console.log('arg:', JSON.stringify(arg));
        //         let selector = arg.selector;
        //         let key = arg.keyName;
        //         let type = arg.type;
        //         let value:string | null = '';

        //         switch (type) {
        //             case 'src':
        //                 value = $(selector).attr('src') || null;
        //                 break;
        //             case 'text':
        //             default:
        //                 value = $(selector).text().trim()  || null;
        //                 break;
        //         }
        //         console.log(`key: ${key}, value: ${value}`);
        //         dynamicObject[key] = value;``
        //     }


        //     await s3
        //         .deleteObject({
        //             Bucket: bucketName,
        //             Key: bucketKey,
        //         })
        //         .promise();

        //     // console.log(`Item with key "${bucketKey}" deleted from bucket "${bucketName}".`);

        //     console.log('Extracted data:', dynamicObject);

        // return {
        //     scrapeInfo: scrapeInfo,
        //     userId: userId,
        //     priceTrackData: dynamicObject
        // };      

        return {
            scrapeInfo: 'scrapeInfo',
            userId: 'userId',
            priceTrackData: null
        };    
    } catch (error) {
        console.error('Error extracting data:', error);
        throw new Error('Failed to extract data from HTML');
    }
};

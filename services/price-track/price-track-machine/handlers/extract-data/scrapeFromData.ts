import * as cheerio from 'cheerio';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

interface ExtractedData {
    scrapeInfo: any;
    userId: string;
    priceTrackData: null;
}

export const handler = async (event:any): Promise<ExtractedData> => {
    try {
        const { s3Key, bucketName, userId, scrapeInfo } = event;

        console.log('event:', JSON.stringify(event));
        const s3Object = await s3
            .getObject({
                Bucket: bucketName,
                Key: s3Key,
            })
            .promise();

        const html = s3Object.Body?.toString('utf-8') || '';

        if (html.length === 0) {
            throw new Error('HTML content is empty');
        }

        const $ = cheerio.load(html);
        let dynamicObject: any = {};
        for (const arg of scrapeInfo.scrapeArgs.extractArgs) {
            console.log('arg:', JSON.stringify(arg));
            let selector = arg.selector;
            let key = arg.keyName;
            let type = arg.type;
            let value:string | null = '';

            switch (type) {
                case 'src':
                    value = $(selector).attr('src') || null;
                    break;
                case 'text':
                default:
                    value = $(selector).text().trim()  || null;
                    break;
            }
            console.log(`key: ${key}, value: ${value}`);
            dynamicObject[key] = value;``
        }


        await s3
            .deleteObject({
                Bucket: bucketName,
                Key: s3Key,
            })
            .promise();

        console.log(`Item with key "${s3Key}" deleted from bucket "${bucketName}".`);

        console.log('Extracted data:', dynamicObject);

        return {
            scrapeInfo: scrapeInfo,
            userId: userId,
            priceTrackData: dynamicObject
        };
    } catch (error) {
        console.error('Error extracting data:', error);
        throw new Error('Failed to extract data from HTML');
    }
};

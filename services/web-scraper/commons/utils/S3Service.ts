import { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const client = new S3Client({ region: process.env.REGION });

export const retrievePayload = async (bucketName: string, bucketKey: string) => {
    console.log(`Retrieving payload from bucket: ${bucketName}, key: ${bucketKey}`);

    if (!bucketName || !bucketKey) {
        throw new Error("Bucket name or key is undefined");
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
        });
        const payload = await client.send(command);

        // const body = await streamToString(payload.Body as ReadableStream);
        const body = await streamToString(payload.Body as Readable);

        return body || '';
    } catch (error) {
        console.error(`Error retrieving payload: ${JSON.stringify(error)}`);
        throw error;
    }
}

const streamToString = async (stream: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
        let data = '';
        stream.on('data', (chunk) => {
            data += chunk;
        });
        stream.on('end', () => {
            resolve(data);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
};

// const streamToString = async (stream: ReadableStream): Promise<string> => {
//     const reader = stream.getReader();
//     let result = '';
//     let done = false;

//     while (!done) {
//         const { value, done: streamDone } = await reader.read();
//         done = streamDone;
//         if (value) {
//             result += new TextDecoder().decode(value);
//         }
//     }

//     return result;
// };

export const deletePayload = async (bucketName: string, bucketKey: string) => {
    console.log(`Deleting payload from bucket: ${bucketName}, key: ${bucketKey}`);

    if (!bucketName || !bucketKey) {
        throw new Error("Bucket name or key is undefined");
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
        });

        await client.send(command);

        console.log(`Successfully deleted payload key: ${bucketKey} from bucket: ${bucketName}`);
    } catch (error) {
        console.error(`Error deleting payload: ${JSON.stringify(error)}`);
        throw error;
    }
};

export const getUserScrapeResultsBucketName = () => {
    return process.env.STAGE === 'prod'
            ? (process.env.RESULT_DB_TABLE_NAME || '')
            : "user-scrape-results-prod";
};

export const getScrapeExtractedDataBucketName = () => {
    return process.env.STAGE === 'prod'
            ? (process.env.S3_EXTRACTED_DATA_BUCKET_NAME || '')
            : "sls-scrape-extracted-data-prod";
};

export const getScrapeHtmlRawResultsBucketName = () => {
    return process.env.STAGE === 'prod'
            ? (process.env.S3_RAW_HTML_RESULT_BUCKET_NAME || '')
            : "sls-scrape-html-raw-results-prod";
};

export const savePayload = async (
    payload: any,
    bucketName: string,
    bucketKey: string,
    contentType: string
): Promise<any> => {
    console.log(`Saving payload to bucket "${bucketName}". bucketKey: "${bucketKey}", contentType: "${contentType}"`);

    if (!bucketName || !bucketKey || !payload || !contentType) {
        throw new Error("Bucket name, key, payload, or content type is undefined");
    }

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
            Body: payload,
            ContentType: contentType,
        });

        await client.send(command);

        console.log(`Item with key "${bucketKey}" added to bucket "${bucketName}"`);

        return {
            status: "COMPLETED"
        };
    } catch (error) {
        console.error(`Error saving payload: ${JSON.stringify(error)}`);
        throw error;
    }
};
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const retrievePayload = async (bucketName: string, bucketKey: string) => {
    console.log(`Retrieving payload from bucket: ${bucketName}, key: ${bucketKey}`);

    if (!bucketName || !bucketKey) {
        throw new Error("Bucket name or key is undefined");
    }

    try {
        const payload = await s3
            .getObject({
                Bucket: bucketName,
                Key: bucketKey,
            })
            .promise();

        return payload.Body?.toString('utf-8') || '';
    } catch (error) {
        console.error(`Error retrieving payload: ${JSON.stringify(error)}`);
        throw error;
    }
}

export const deletePayload = async (bucketName: string, bucketKey: string) => {
    console.log(`deleting payload from bucket: ${bucketName}, key: ${bucketKey}`);

    if (!bucketName || !bucketKey)
        throw new Error("Bucket name or key is undefined");

    try {
        await s3
            .deleteObject({
                Bucket: bucketName,
                Key: bucketKey,
            })
            .promise();

        console.log(`successfully deleted payload key: ${bucketKey} from bucket: ${bucketName}`);
    } catch (error) {
        console.error(`Error deleting payload: ${JSON.stringify(error)}`);
        throw error;
    }
}

export const savePayload = async (
    payload: any,
    bucketName: string,
    bucketKey: string,
    contentType: string
): Promise<any> => {
    console.log(`saving scrape html to bucket "${bucketName}". bucketKey: "${bucketKey}", contentType: "${contentType}"`);

    try {
        await s3
            .putObject({
                Bucket: bucketName,
                Key: bucketKey,
                Body: payload,
                ContentType: contentType,
            })
            .promise();

        console.log(`Item with key "${bucketKey}" added to bucket ${bucketName}`);

        return {
            status: "COMPLETED"
        };
    } catch (error) {
        console.error(`Error saving payload: ${JSON.stringify(error)}`);
        throw error;
    }
};
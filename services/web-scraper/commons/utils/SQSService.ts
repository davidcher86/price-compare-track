import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({region: process.env.REGION});

export const sendMessageToQueue = async (
    queueUrl: string,
    messageBody: object
): Promise<string> => {
    console.log(`Sending message to SQS queue: ${queueUrl}, messageBody: ${JSON.stringify(messageBody)}`);
    try {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(messageBody),
        });
        const response = await sqsClient.send(command);
        return response.MessageId || "Unknown";
    } catch (error) {
        console.error(`Error sending message to SQS queue: ${JSON.stringify(error)}`);
        throw error;
    }
};

export const generateDlqSqsPayload = (data: any, event: string, errorMessage: string): any => {
    const payload: any = {event: event, error: errorMessage, ...data};

    return payload;
}


export const getDlqSqsName = (): any => {
    return process.env.STAGE === 'prod'
    ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_SCRAPE_DLQ}`
    : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/scrape-dlq-prod`;
}

export const getExtractDataSqsName = (): any => {
    return process.env.STAGE === 'prod'
    ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_EXTRACTED_DATA}`
    : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/extracted-data-results-queue-prod`;
}

export const getAccepetScrapeRequestSqsName = (): any => {
    return process.env.STAGE === 'prod'
    ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_SCRAPE_REQUEST}`
    : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/accept-scrape-request-queue-prod`;
}

export const getHtmlRawResultSqsName = (): any => {
    return process.env.STAGE === 'prod'
    ? `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_HTML_RAW_DATA_RESULT}`
    : `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/html-raw-data-results-queue-prod`;
}
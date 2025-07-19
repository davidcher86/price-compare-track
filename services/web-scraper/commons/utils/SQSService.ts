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
        console.log(`sending ${JSON.stringify(command)} to queue ${queueUrl}`);
        const response = await sqsClient.send(command);
        return response.MessageId || "Unknown";
    } catch (error) {
        console.error(`Error sending message to SQS queue: ${error}`);
        throw error;
    }
};
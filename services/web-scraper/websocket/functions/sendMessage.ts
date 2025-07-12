import { Lambda } from 'aws-sdk';

export const handler = async () => {
    const lambda = new Lambda();
    await lambda.invoke({
        FunctionName: 'websocket-app-dev-notifyClient',
        InvocationType: 'Event',
        Payload: JSON.stringify({
            body: JSON.stringify({ message: 'Hello from another function!' }),
        }),
    }).promise();

    return {
        statusCode: 200,
        body: 'Notification sent.',
    };
};
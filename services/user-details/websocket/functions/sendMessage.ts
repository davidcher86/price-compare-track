// import { Lambda } from 'aws-sdk';
import {postToHttpApiGateway} from '../../commons/utils/ApiGatewayService.ts';

export const handler = async () => {
    console.log('sending');
    const functionName = 'function:sls-user-details-prod-sendMessage';
    await postToHttpApiGateway(functionName, { message: 'Hello from another function!' })
    // const lambda = new Lambda();
    // await lambda.invoke({
    //     FunctionName: 'websocket-app-dev-notifyClient',
    //     InvocationType: 'Event',
    //     Payload: JSON.stringify({
    //         body: JSON.stringify({ message: 'Hello from another function!' }),
    //     }),
    // }).promise();

    return {
        statusCode: 200,
        body: 'Notification sent.',
    };
};
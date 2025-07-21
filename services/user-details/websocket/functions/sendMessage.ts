// import { Lambda } from 'aws-sdk';
import {postToHttpApiGateway} from '../../commons/utils/ApiGatewayService.ts';
import { handler as notifyClientHandler } from "../functions/notifyClient.ts";
export const handler = async (event) => {
    try {
        // console.log('sending');
        const userId = event.headers?.userId;

        const functionName = 'sls-user-details-prod-notifyClient'; // Replace with your actual function name or ARN
        
        const res = process.env.TAGE === 'prod'
            ? await postToHttpApiGateway(functionName, { userId: userId, message: 'Hello from another function!' })
            : await notifyClientHandler({ message: "hhhh", body: JSON.stringify({userId: userId}) }); 
        
        console.log(res);

        return {
            statusCode: 200,
            body: 'Notification sent.',
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            body: `Error sending notification: ${error.message}`,
        };
    }
};
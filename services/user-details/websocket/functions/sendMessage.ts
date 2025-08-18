import {postToHttpApiGateway} from './../../../commons/utils/ApiGatewayService';
import { handler as notifyClientHandler } from "../functions/notifyClient";
export const handler = async (event) => {
    try {
        const userId = event.headers?.userId;

        const functionName = 'sls-user-details-prod-notifyClient';
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
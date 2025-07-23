import {retrieveUserWebsocket, deleteUserWebesocket} from "../../commons/utils/DynamoDBService.ts";
import {postToWebSocketConnection} from "../../commons/utils/ApiGatewayService.ts";

export const handler = async (event: any) => {
    console.log('event')
    console.log(event)
    const {message,userId} = event;

    const connections = await retrieveUserWebsocket(userId);

    const sendMessages = connections.map(async ({ connectionId }) => {
        try {
            const domain = `${process.env.WS_CONNECTIONS_DOMAIN}/prod` || '';
            const msg = {status: message, userId: userId};
            console.log(`Sending message to connectionId: ${connectionId} with message: ${message}`);
            
            await postToWebSocketConnection(connectionId, JSON.stringify(message), domain);
        } catch (err) {
            if ((err as any).statusCode === 410) {
                const connectionRescord = { connectionId }; 
                await deleteUserWebesocket(connectionRescord);
            }
        }
    });

    await Promise.all(sendMessages || []);

    return { statusCode: 200, body: 'Message sent' };
};
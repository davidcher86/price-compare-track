import {retrieveUserWebsocket, deleteUserWebesocket} from "../../commons/utils/DynamoDBService.ts";
import {postToWebSocketConnection} from "../../commons/utils/ApiGatewayService.ts";

export const handler = async (event: any) => {
    console.log('event')
    console.log(event)
    // const body = JSON.parse(event.body);
    // console.log(`Received body: ${event.body}`);
    const {message,userId} = event;

    const connections = await retrieveUserWebsocket(userId);
    // console.log('connections');
    // console.log(connections);
    const sendMessages = connections.map(async ({ connectionId }) => {
        try {
            // console.log(`stage: ${process.env.STAGE}`);
            // const domain = process.env.STAGE === 'prod'
            // ? `https://${process.env.WS_CONNECTIONS_DOMAIN}`
            // : `http://localhost:4001`;

            const domain = process.env.WS_CONNECTIONS_DOMAIN || '';
            console.log(`Domain: ${domain}`);
            const message = {status: "SCRAPE_COMPLETED", userId: userId}; //TODO: add new endpoint
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
import {retrieveUserWebsocket, deleteUserWebesocket} from "../../commons/utils/DynamoDBService.ts";
import {postToWebSocketConnection} from "../../commons/utils/ApiGatewayService.ts";

export const handler = async (event: any) => {
    const body = JSON.parse(event.body);
    console.log(`Received body: ${event.body}`);
    const {message,userId} = body;

    const connections = await retrieveUserWebsocket(userId);
    // console.log('connections');
    // console.log(connections);
    const sendMessages = connections.map(async ({ connectionId }) => {
        try {
            const domain = process.env.STAGE === 'prod'
            ? `https://${process.env.WS_CONNECTIONS_DOMAIN}`
            : `http://localhost:4001`;

            console.log(`Domain: ${domain}`);

            const message = {status: "SCRAPE_COMPLETED"}; //TODO: add new endpoint
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
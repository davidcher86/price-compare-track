import {deleteRecord, retrieveAllTableRecord} from "../../commons/utils/DynamoDBService.ts";
import {postToConnection} from "../../commons/utils/ApiGatewayService.ts";

// const db = new DynamoDB.DocumentClient();

export const handler = async (event: any) => {
    const body = JSON.parse(event.body);
    const message = body.message;

    const domain = event.requestContext
        ? `https://${event.requestContext.domainName}/${event.requestContext.stage}`
        : `https://${process.env.WS_CONNECTIONS_DOMAIN}`; // For cross-function calls

    // const apiGw = new ApiGatewayManagementApi({ endpoint: domain });

    const connectionsTble = process.env.WS_CONNECTIONS_TABLE_NAME || '';
    const connections = await retrieveAllTableRecord(connectionsTble);
    // const connections = await db.scan({
    //     TableName: process.env.WS_CONNECTIONS_TABLE_NAME!
    // }).promise();

    const sendMessages = connections.Items?.map(async ({ connectionId }) => {
        try {
            const endpoint = ''; //TODO: add new endpoint
            await postToConnection(connectionId, JSON.stringify({ message }), endpoint);
            // await apiGw.postToConnection({
            //     ConnectionId: connectionId,
            //     Data: JSON.stringify({ message })
            // }).promise();
        } catch (err) {
            if ((err as any).statusCode === 410) {
                const tableName = process.env.WS_CONNECTIONS_TABLE_NAME || '';
                const connectionRescord = { connectionId }; 
                await deleteRecord(tableName, connectionRescord);
                // await db.delete({
                //     TableName: process.env.WS_CONNECTIONS_TABLE_NAME,
                //     Key: { connectionId }
                // }).promise();
            }
        }
    });

    await Promise.all(sendMessages || []);
    return { statusCode: 200, body: 'Message sent' };
};
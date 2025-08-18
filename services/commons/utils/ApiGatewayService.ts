import { LambdaClient, InvokeCommand, LogType } from "@aws-sdk/client-lambda";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new LambdaClient({ 
    region: process.env.REGION,
    // endpoint: "http://localhost:4002" //TODO: remove for prod
});

export const postToHttpApiGateway = async (functionName: string, payloadObj:any) => {
    try {
        console.log('payloadObj');
        console.log(payloadObj);
        const command = new InvokeCommand({
            FunctionName: functionName,  // name or ARN of Lambda B
            Payload: new TextEncoder().encode(JSON.stringify(payloadObj)),
            LogType: LogType.Tail,
            InvocationType: "RequestResponse",
            // InvocationType: 'Event' // default is RequestResponse
        });

        const response = await client.send(command);

        const result = response.Payload
            ? new TextDecoder().decode(response.Payload)
            : null;
        const logs = response.LogResult
            ? new TextDecoder().decode(new TextEncoder().encode(response.LogResult))
            : null;

        console.log(`lambda ${functionName} response: ${result}`);

        return result ? JSON.parse(result) : null;
    } catch (error) {
        console.error(`Failed to send message to lambda ${functionName}:`, error);
        throw error;
    }
};

export const postToWebSocketConnection = async (connectionId: string, data: string, endpoint: string): Promise<void> => {
    try {
        console.log('endpoint: ' + endpoint);
        const client = new ApiGatewayManagementApiClient({
            endpoint: 'https://' + endpoint, // The WebSocket endpoint (e.g., https://<api-id>.execute-api.<region>.amazonaws.com/<stage>)
        });

        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(data),
        });

        await client.send(command);
        console.log(`Message sent to connection ${connectionId}`);
    } catch (error) {
        console.error(`Failed to send message to connection ${connectionId}:`, error);
        throw error;
    }
};
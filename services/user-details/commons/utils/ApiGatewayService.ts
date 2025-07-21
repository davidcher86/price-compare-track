import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { LambdaClient, InvokeCommand, LogType } from "@aws-sdk/client-lambda";

export const postToWebSocketConnection = async (connectionId: string, data: string, endpoint: string): Promise<void> => {
    try {
        const client = new ApiGatewayManagementApiClient({
            endpoint, // The WebSocket endpoint (e.g., https://<api-id>.execute-api.<region>.amazonaws.com/<stage>)
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

const client = new LambdaClient({ 
    region: process.env.REGION,
    endpoint: "http://localhost:4002" //TODO: remove for prod
});

export const postToHttpApiGateway = async (functionName: string, payloadObj:any) => {
    try {
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

// export const postToHttpApiGateway = async (postRequest: any) => {
//     const body = postRequest.body;
//     const message = body.message;

//     const domain = event.requestContext
//         ? `http://${event.requestContext.domainName}/${process.env.STAGE}`
//         : `http://localhost:${process.env.LOCAL_PORT}`; // Replace with your local serverless offline URL

//     const endpoint = `${domain}/your-http-endpoint`; // Replace with the specific POST endpoint

//     const client = new ApiGatewayManagementApiClient({ endpoint });

//     try {
//         const command = new PostToConnectionCommand({
//             ConnectionId: "local-connection-id", // Replace with the connection ID if needed
//             Data: JSON.stringify({ message }),
//         });

//         const response = await client.send(command);
//         console.log("Response from Lambda:", response);
//     } catch (error) {
//         console.error("Error sending message to Lambda:", error);
//         throw error;
//     }
// };
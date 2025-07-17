import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export const postToApiGateway = async (connectionId: string, data: string, endpoint: string): Promise<void> => {
    try {
        // Initialize the API Gateway Management API client
        const client = new ApiGatewayManagementApiClient({
            endpoint, // The WebSocket endpoint (e.g., https://<api-id>.execute-api.<region>.amazonaws.com/<stage>)
        });

        // Create the PostToConnectionCommand
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId, // The connection ID to send the message to
            Data: Buffer.from(data), // The data to send (must be a Buffer)
        });

        // Send the command
        await client.send(command);
        console.log(`Message sent to connection ${connectionId}`);
    } catch (error) {
        console.error(`Failed to send message to connection ${connectionId}:`, error);
        throw error;
    }
};
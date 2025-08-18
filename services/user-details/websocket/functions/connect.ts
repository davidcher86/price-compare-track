import {saveUserWebsocket} from "./../../../commons/utils/DynamoDBService";

export const handler = async (event: any) => {
    const connectionId = event.requestContext.connectionId;

    const queryStringParameters = event.queryStringParameters;
    const { userId, domain } = queryStringParameters;

    try {
        console.log(`new connection request accpeted: [connectionId: ${connectionId}, domain: ${domain}]`);
        await saveUserWebsocket(connectionId, userId, domain);

        return { statusCode: 200 };
    } catch (error) {
        console.error(`Error saving connection request: [connectionId: ${connectionId}, domain: ${domain}], error: ${error}`);
        return {
            statusCode: 500,
            body: `Error saving connection: ${error.message}`,
        };
    }
};
// import { DynamoDB } from 'aws-sdk';
import {saveUserWebsocket} from "../../commons/utils/DynamoDBService.ts";

// const db = new DynamoDB.DocumentClient();
export const handler = async (event: any) => {
    const connectionId = event.requestContext.connectionId;
    console.log('event.queryStringParameters');
    console.log(event.queryStringParameters);
    const queryStringParameters = event.queryStringParameters;
    const userId = queryStringParameters.userId;
    const domain = queryStringParameters.domain; 

    try {
        // const connectionRecord = { connectionId: String(connectionId), userId: userId };
        console.log("connectionId", connectionId);
        console.log("domain", domain);
        await saveUserWebsocket(connectionId, userId, domain);
        // await db.put({
        //     TableName: process.env.WS_CONNECTIONS_TABLE_NAME,
        //     Item: { connectionId }
        // }).promise();

        return { statusCode: 200 };
    } catch (error) {
        console.error('Error saving connection:', error);
        return {
            statusCode: 500,
            body: `Error saving connection: ${error.message}`,
        };
    }
};
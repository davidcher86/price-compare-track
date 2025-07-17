// import { DynamoDB } from 'aws-sdk';
import {saveRecord} from "../../commons/utils/DynamoDBService.ts";

// const db = new DynamoDB.DocumentClient();
export const handler = async (event: any) => {
    const connectionId = event.requestContext.connectionId;
    const tableName = process.env.WS_CONNECTIONS_TABLE_NAME || '';
    const connectionRecord = { connectionId };
    await saveRecord(tableName, connectionRecord);
    // await db.put({
    //     TableName: process.env.WS_CONNECTIONS_TABLE_NAME,
    //     Item: { connectionId }
    // }).promise();

    return { statusCode: 200 };
};
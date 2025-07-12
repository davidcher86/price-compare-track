// import { DynamoDB } from 'aws-sdk';
import {deleteRecord} from "../../commons/utils/DynamoDBService.ts";

// const db = new DynamoDB.DocumentClient();
export const handler = async (event: any) => {
    const connectionId = event.requestContext.connectionId;
    await deleteRecord(process.env.WS_CONNECTIONS_TABLE_NAME!, { connectionId });
    // await db.delete({
    //     TableName: process.env.WS_CONNECTIONS_TABLE_NAME!,
    //     Key: { connectionId }
    // }).promise();

    return { statusCode: 200 };
};
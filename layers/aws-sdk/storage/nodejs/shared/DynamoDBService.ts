import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, ScanCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const saveRecord = async (
    tableName: string,
    record: any
): Promise<void> => {
    try {
        console.log('Adding result-set to DynamoDB: to' + tableName);
        await ddb.send(new PutCommand({
            TableName: tableName,
            Item: record,
        }));

        console.log('new record added to table:', tableName);
    } catch (err) {
        console.error("Error adding results:", err);
        throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const deleteRecord = async (
    tableName: string,
    record: any
): Promise<void> => {
    try {
        console.log('Adding result-set to DynamoDB: to' + tableName);
        await ddb.send(new PutCommand({
            TableName: tableName,
            Item: record,
        }));

        console.log('new record added to table:', tableName);
    } catch (err) {
        console.error("Error adding results:", err);
        throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const retrieveAllTableRecord = async (
    tableName: string
): Promise<any> => {
    try {
        console.log('returning all records from DynamoDB table: ' + tableName);
        return await ddb.send(new ScanCommand({
            TableName: tableName
        }));
    } catch (err) {
        console.error("Error adding results:", err);
        throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
    }
};
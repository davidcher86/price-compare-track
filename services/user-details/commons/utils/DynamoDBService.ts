import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";

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
        console.log('Adding record to DynamoDB: to table' + tableName);
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

export const retrieveScrapeHistory = async (
    tableName: string,
    userId: any
): Promise<any> => {
    try {
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId);  
        // return await ddb.send(new GetCommand({
        //     TableName: tableName,
        //     Key: key
        // }));
        return await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId", // Query condition
            ExpressionAttributeValues: {
                ":userId": userId, // Bind the value for userId
            },
            ProjectionExpression: "scrapeRequestId, userId, #query, #source, scrapeDate",
            ExpressionAttributeNames: {
                "#query": "query", // Alias for the reserved keyword
                "#source": "source",
            },
        }));
    } catch (err) {
        console.error("Error retrieving results:", err);
        throw new Error(`Failed to retrieve results from DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const retrieveScrapeResult = async (
    tableName: string,
    userId: any,
    scrapeRequestId: string
): Promise<any> => {
    try {
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId + ' scrapeRequestId: ' + scrapeRequestId);  

        return await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId AND scrapeRequestId = :scrapeRequestId", // Query condition
            ExpressionAttributeValues: {
                ":userId": userId,
                ":scrapeRequestId": scrapeRequestId, // Bind the value for userId
            },
            // ProjectionExpression: "scrapeRequestId, userId, #query, #source, scrapeDate",
            // ExpressionAttributeNames: {
            //     "#query": "query", // Alias for the reserved keyword
            //     "#source": "source",
            // },
        }));
    } catch (err) {
        console.error("Error retrieving scrape results:", err);
        throw new Error(`Failed to retrieve results from DynamoDB: ${JSON.stringify(err)}`);
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
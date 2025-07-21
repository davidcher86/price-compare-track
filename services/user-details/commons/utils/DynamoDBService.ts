import {DeleteItemCommand, DynamoDBClient, QueryCommandInput} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

// export const saveRecord = async (
//     tableName: string,
//     record: any
// ): Promise<void> => {
//     try {
//         console.log('Adding result-set to DynamoDB: to' + tableName);
//         await ddb.send(new PutCommand({
//             TableName: tableName,
//             Item: record,
//         }));

//         console.log('new record added to table:', tableName);
//     } catch (err) {
//         console.error("Error adding results:", err);
//         throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
//     }
// };

// export const deleteRecord = async (
//     tableName: string,
//     record: any
// ): Promise<void> => {
//     try {
//         console.log('Adding record to DynamoDB: to table' + tableName);
//         await ddb.send(new PutCommand({
//             TableName: tableName,
//             Item: record,
//         }));

//         console.log('new record added to table:', tableName);
//     } catch (err) {
//         console.error("Error adding results:", err);
//         throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
//     }
// };

export const retrieveScrapeHistory = async (
    userId: any
): Promise<any> => {
    try {
        const tableName = process.env.USER_DETAILS_TABLE
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId);  
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
        return [];
        // throw new Error(`Failed to retrieve results from DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const retrieveScrapeResult = async (
    userId: any,
    scrapeRequestId: string
): Promise<any> => {
    try {
        const tableName = process.env.RESULT_DB_TABLE_NAME
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId + ' scrapeRequestId: ' + scrapeRequestId);  

        return await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId", // Query by userId
            FilterExpression: "scrapeRequestId = :scrapeRequestId",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":scrapeRequestId": scrapeRequestId, // Bind the value for userId
            },
        }));
    } catch (err) {
        console.error("Error retrieving scrape results:", err);
        return [];
        // throw new Error(`Failed to retrieve results from DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const saveUserWebsocket = async (
    connectionId: any,
    userId: string,
): Promise<void> => {
    try {
        const tableName = process.env.WS_CONNECTIONS_TABLE_NAME || '';
        const connectionRecord = { connectionId, userId };

        console.log('Adding result-set to DynamoDB: to' + tableName);

        await ddb.send(new PutCommand({
            TableName: tableName,
            Item: connectionRecord,
        }));

        console.log('new record added to table:', tableName);
    } catch (err) {
        console.error("Error adding results:", err);
        throw new Error(`Failed to save results to DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const retrieveUserWebsocket = async (
    userId: string
): Promise<any> => {
    try {
        const tableName = 'ws-scrape-result-connections-prod';
        console.log('returning user websocket from DynamoDB table: ' + tableName);

        const response = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId", // Query by userId
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        }));

        const records = response.Items?.map((item) => {
            return {
              connectionId: item.connectionId,
              userId: item.userId,
            };
        }) || [];

        return records;
    } catch (err) {
        console.error("Error restrieving user websocket results:", err);
        return [];
    }
};

export const deleteUserWebesocket = async (
    connectionId: any
): Promise<void> => {
    try {
        const tableName = process.env.WS_CONNECTIONS_TABLE_NAME;
        console.log('deleting websocket from DynamoDB:' + tableName );
        await ddb.send(new DeleteItemCommand({
            TableName: tableName,
            Key: {
                connectionId: { S: connectionId },
            },
        }));

        console.log('deleted');
    } catch (err) {
        console.error("Error deleting records:", err);
        throw new Error(`Failed to delete records from DynamoDB table: ${process.env.WS_CONNECTIONS_TABLE_NAME}`);
    }
};
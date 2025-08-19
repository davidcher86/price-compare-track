import {DynamoDBClient, DeleteItemCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand, BatchWriteCommand, DeleteCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const saveRecord = async (
    tableName: string,
    record: any
): Promise<void> => {
    try {
        console.log('Adding result-set to DynamoDB: ' + tableName);
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
    key: Record<string, any>
): Promise<void> => {
    try {
        console.log('Deleting record from DynamoDB: ' + tableName);
        await ddb.send(new DeleteCommand({
            TableName: tableName,
            Key: key,
        }));

        console.log('Record deleted from table:', tableName);
    } catch (err) {
        console.error("Error deleting record:", err);
        throw new Error(`Failed to delete record from DynamoDB: ${JSON.stringify(err)}`);
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

export const retrieveScrapeHistory = async (
    userId: any
): Promise<any> => {
    try {
        const tableName = process.env.RESULT_DB_TABLE_NAME;
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId);  
        return await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId", // Query condition
            ExpressionAttributeValues: {
                ":userId": userId, // Bind the value for userId
            },
            ProjectionExpression: "scrapeRequestId, userId, #query, #source, scrapeDate, endScrapeDt, startScrapeDt",
            ExpressionAttributeNames: {
                "#query": "query", // Alias for the reserved keyword
                "#source": "source",
            },
            ScanIndexForward: false,
        }));
    } catch (err) {
        console.error("Error retrieving results:", err);
        return [];
    }
};

export const deleteScrapeResults = async (
    scrapeRequestId: string
): Promise<any> => {
    try {
        const tableName = process.env.RESULT_DB_TABLE_NAME;
        console.log('deleting records from DynamoDB table: ' + tableName + ' scrapeRequestId: ' + scrapeRequestId);

        console.log(`Deleting records for scrapeRequestId: ${scrapeRequestId}`);
        const queryResult = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "scrape-request-id-index",
            KeyConditionExpression: "scrapeRequestId = :scrapeRequestId",
            ExpressionAttributeValues: {
                ":scrapeRequestId": scrapeRequestId,
            },
        }));

        if (!queryResult.Items || queryResult.Items.length === 0) {
            console.log('No records found for scrapeRequestId:', scrapeRequestId);
            return { success: true, message: 'No records found to delete' };
        }

        // Use BatchWriteItem for efficient deletion (up to 25 items per batch)
        const items = queryResult.Items;
        const batches = [];
        
        // Split items into batches of 25
        for (let i = 0; i < items.length; i += 25) {
            const batch = items.slice(i, i + 25);
            batches.push(batch);
        }

        let totalDeleted = 0;
        
        for (const batch of batches) {
            const deleteRequests = batch.map(item => ({
                DeleteRequest: {
                    Key: {
                        scrapeId: item.scrapeId
                    }
                }
            }));

            await ddb.send(new BatchWriteCommand({
                RequestItems: {
                    [tableName!]: deleteRequests
                }
            }));
            
            totalDeleted += batch.length;
        }

        console.log(`Successfully deleted ${totalDeleted} records for scrapeRequestId:`, scrapeRequestId);
        return { success: true, deletedCount: totalDeleted };
    } catch (err) {
        console.error("Error deleting scrape results:", err);
        return { success: false, error: JSON.stringify(err) };
    }
};

export const retrieveScrapeResult = async (
    userId: any,
    scrapeRequestId: string
): Promise<any> => {
    try {
        const tableName = process.env.RESULT_DB_TABLE_NAME
        console.log('returning all scrape result records from DynamoDB table: ' + tableName + ' userId: ' + userId + ' scrapeRequestId: ' + scrapeRequestId);  

        // Convert inputs to strings to ensure data type consistency
        const userIdStr = String(userId);
        const scrapeRequestIdStr = String(scrapeRequestId);

        console.log('Query parameters - userId:', userIdStr, 'scrapeRequestId:', scrapeRequestIdStr);
        console.log('Query parameters types - userId:', typeof userIdStr, 'scrapeRequestId:', typeof scrapeRequestIdStr);

        // Use the scrape-request-id-index to query by scrapeRequestId first
        const queryParams = {
            TableName: tableName,
            IndexName: "scrape-request-id-index", // Use the scrape-request-id index
            KeyConditionExpression: "scrapeRequestId = :scrapeRequestId",
            ExpressionAttributeValues: {
                ":scrapeRequestId": scrapeRequestIdStr,
            },
        };
        
        console.log('DynamoDB Query Params:', JSON.stringify(queryParams, null, 2));
        
        const result = await ddb.send(new QueryCommand(queryParams));
        
        // Filter results by userId on the client side for security
        if (result.Items && result.Items.length > 0) {
            const filteredItems = result.Items.filter(item => 
                String(item.userId) === userIdStr
            );
            
            console.log('Filtered result count for userId:', filteredItems.length);
            
            return {
                ...result,
                Items: filteredItems,
                Count: filteredItems.length,
                ScannedCount: result.ScannedCount
            };
        }
        
        return result;
    } catch (err) {
        console.error("Error retrieving scrape results:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        return [];
    }
};

export const saveUserWebsocket = async (
    connectionId: any,
    userId: string,
    domain: string
): Promise<void> => {
    try {
        const tableName = process.env.WS_CONNECTIONS_TABLE_NAME || '';
        const connectionRecord = { 
            connectionId: connectionId, 
            userId: userId,
            domain: domain,
            createDt: new Date().toISOString(),
        };

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
              domain: item.domain,
              createDt: item.createDt,
            };
        }) || [];

        return records;
    } catch (err) {
        console.error("Error retrieving user websocket results:", err);
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
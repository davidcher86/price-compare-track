import {DynamoDBClient, DeleteItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand, BatchWriteCommand, DeleteCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";

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
            ProjectionExpression: "scrapeId, scrapeRequestId, userId, #query, #source, scrapeDate, endScrapeDt, startScrapeDt",
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

interface PriceTrackItem {
    id: string;
    scrapeCode: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createdDt: string; // Fixed: createdDt to match table schema
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // This will be converted to "true"/"false" string when stored in DynamoDB
    href?: string;
    name?: string;
}

interface PriceTrackResultRecord {
    scrapeCode: string;
    userId: string;
    source: string;
    productName: string;
    startScrapeDt: string;
}

const getPriceTrackScheduledItemsTableName = () => {
    return process.env.STAGE === 'prod'
            ? (process.env.PRICE_TRACK_SCHEDULED_ITEMS_TABLE_NAME || '')
            : "scheduled-price-tracks-prod";
};

export const addPriceTrackRecord = async (
    priceTrackItem: PriceTrackItem
): Promise<any> => {
    try {
        const tableName = getPriceTrackScheduledItemsTableName();

        console.log('adding new price track item to DynamoDB table: ' + tableName);
        
        // Convert boolean to string for DynamoDB GSI compatibility (S type)
        const item = {
            ...priceTrackItem,
            enabled: priceTrackItem.enabled ? "true" : "false"
        };
        
        await ddb.send(new PutCommand({
            TableName: tableName,
            Item: item,
        }));

        console.log('new record added to table:', tableName);
    } catch (err) {
        console.error("Full error details:", err);
        throw new Error(`Failed to add new price track results from DynamoDB: ${JSON.stringify(err)}`);
    }
};

export const retrievePriceTrackScheduledItems = async (
    userId: any
): Promise<PriceTrackItem[]> => {
    try {
        const tableName = process.env.PRICE_TRACK_SCHEDULED_ITEMS_TABLE_NAME || '';
        console.log('returning all records from DynamoDB table: ' + tableName + ' userId: ' + userId);
        const queryResult = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId", // Query condition
            ExpressionAttributeValues: {
                ":userId": userId, // Bind the value for userId
            },
            // ProjectionExpression: "scrapeRequestId, userId, #query, #source, scrapeDate, endScrapeDt, startScrapeDt",
            // ExpressionAttributeNames: {
            //     "#query": "query", // Alias for the reserved keyword
            //     "#source": "source",
            // },
            ScanIndexForward: false,
        }));
        
        const response: PriceTrackItem[] = queryResult.Items as PriceTrackItem[] || [];

        return response;
    } catch (err) {
        console.error("Error retrieving results:", err);
        return [];
    }
};

export const retrieveAllEnabledPriceTrackItems = async (): Promise<PriceTrackItem[]> => {
    try {
        const tableName = process.env.PRICE_TRACK_SCHEDULED_ITEMS_TABLE_NAME || '';
        console.log('returning all enabled records from DynamoDB table: ' + tableName);
        const scanResult = await ddb.send(new ScanCommand({
            TableName: tableName,
            FilterExpression: "enabled = :enabled",
            ExpressionAttributeValues: {
                ":enabled": "true",
            },
        }));

        const response: PriceTrackItem[] = scanResult.Items as PriceTrackItem[] || [];
        console.log('All enabled price track items retrieved successfully, counted:', response.length);
        return response;
    } catch (err) {
        console.error("Error retrieving results:", err);
        return [];
    }
}

const getPriceTrackResultsTableName = () => {
    return process.env.STAGE === 'prod'
            ? (process.env.PRICE_TRACK_RESULTS_TABLE_NAME || '')
            : "price-track-results-prod";
};

export const savePriceTrackRecord = async (payload: any): Promise<void> => {
    try {
        const TableName = getPriceTrackResultsTableName();

        console.log('Adding price track record to DynamoDB: ' + TableName);
        const params = {
            TableName: TableName,
            Item: payload,
        };

        console.log('Adding price track record to DynamoDB: ' + TableName);
        console.log('Payload:', JSON.stringify(payload));

        await ddb.send(new PutCommand(params));
    } catch (error) {
        console.error('Error saving price track record:', error);
        throw new Error('Failed to save price track record');
    }
};

export const retrievePriceTrackResultsScrapeCodeGrouped = async (
    userId: string
): Promise<any[]> => {
    try {
        const tableName = getPriceTrackScheduledItemsTableName(); // Changed to scheduled items table
        console.log('returning all price track scheduled items from DynamoDB table: ' + tableName + ' userId: ' + userId);
        console.log('userId type:', typeof userId, 'userId value:', JSON.stringify(userId));
        
        // First, let's try a simple scan to see if there's any data at all
        console.log('=== DEBUG: Scanning table to check for any data ===');
        const result = await ddb.send(new ScanCommand({
            TableName: tableName
        }));
        

        return result.Items || [];
    } catch (err) {
        console.error("Error retrieving price track scheduled items:", err);
        return [];
    }
};

export const retrievePScheduledPriceTrackList = async (
    userId: string
): Promise<any[]> => {
    try {
        const tableName = getPriceTrackScheduledItemsTableName();
        const scanResult = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "user-id-index", // Specify the GSI name
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }));

        // console.log('Scan result - items found:', scanResult.Items?.length);
        // console.log('Scan result items:', JSON.stringify(scanResult.Items, null, 2));
        
        return scanResult.Items || [];
    } catch (err) {
        console.error("Error retrieving price track scheduled items:", err);
        return [];
    }
};

export const retrievePriceTrackResultsByScrapeCode = async (
    scrapeCode: string
): Promise<any[]> => {
    try {
        const tableName = getPriceTrackResultsTableName();
        console.log('returning price track results from DynamoDB table: ' + tableName + ' scrapeCode: ' + scrapeCode);
        
        const queryResult = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "scrape-code-index", // Specify the GSI name for scrapeCode
            KeyConditionExpression: "scrapeCode = :scrapeCode", // Query condition
            ExpressionAttributeValues: {
                ":scrapeCode": scrapeCode, // Bind the value for scrapeCode
            },
            ScanIndexForward: false, // Sort by sort key in descending order (newest first)
        }));

        console.log('Price track results retrieved successfully for scrapeCode, count:', queryResult.Items?.length);
        
        return queryResult.Items || [];
    } catch (err) {
        console.error("Error retrieving price track results by scrapeCode:", err);
        return [];
    }
};

export const deletePScheduledPriceTrackById = async (
    id: string
): Promise<{ success: boolean; deletedCount?: number; message?: string; error?: string }> => {
    try {
        const tableName = getPriceTrackScheduledItemsTableName();
        console.log('deleting price track scheduled records from DynamoDB table: ' + tableName + ' id: ' + id);
        console.log('id type:', typeof id, 'id value:', JSON.stringify(id));

        // Validate input
        if (!id || typeof id !== 'string' || id.trim() === '') {
            console.error('Invalid id provided:', id);
            return { success: false, message: 'Invalid id provided' };
        }

        // Use the correct primary key (id) to delete the record with ReturnValues to confirm deletion
        const deleteResult = await ddb.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                id: id.trim() // Use 'id' which is the primary key, clean any whitespace
            },
            ReturnValues: "ALL_OLD" // This will return the deleted item if it existed
        }));

        console.log('Delete operation result:', JSON.stringify(deleteResult, null, 2));

        if (deleteResult.Attributes) {
            console.log(`Successfully deleted scheduled record with id: ${id}`);
            console.log('Deleted item:', JSON.stringify(deleteResult.Attributes, null, 2));
            return { success: true, deletedCount: 1 };
        } else {
            console.log(`No item was deleted - item with id ${id} does not exist`);
            return { success: false, message: `No item found with id: ${id}` };
        }
    } catch (err) {
        console.error("Error deleting price track scheduled records:", err);
        console.error("Full error details:", JSON.stringify(err, null, 2));
        return { success: false, error: JSON.stringify(err) };
    }
};

export const deletePriceTrackResults = async (
    scrapeCode: string
): Promise<{ success: boolean; deletedCount?: number; message?: string; error?: string }> => {
    try {
        const tableName = getPriceTrackResultsTableName();
        console.log('deleting price track results records from DynamoDB table: ' + tableName + ' scrapeCode: ' + scrapeCode);

        if (!scrapeCode || typeof scrapeCode !== 'string' || scrapeCode.trim() === '') {
            console.error('Invalid scrapeCode provided:', scrapeCode);
            return { success: false, message: 'Invalid scrapeCode provided' };
        }

        console.log(`Deleting records for scrapeCode: ${scrapeCode}`);
        const queryResult = await ddb.send(new QueryCommand({
            TableName: tableName,
            IndexName: "scrape-code-index",
            KeyConditionExpression: "scrapeCode = :scrapeCode",
            ExpressionAttributeValues: {
                ":scrapeCode": scrapeCode,
            },
        }));

        if (!queryResult.Items || queryResult.Items.length === 0) {
            console.log('No records found for scrapeCode:', scrapeCode);
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
                        id: item.id // Use 'id' as the primary key for PriceTrackResultsTable
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

        console.log(`Successfully deleted ${totalDeleted} records for scrapeCode:`, scrapeCode);
        return { success: true, deletedCount: totalDeleted };
    } catch (err) {
        console.error("Error deleting price track results:", err);
        return { success: false, error: JSON.stringify(err) };
    }
};

export const togglePriceTrackEnableProp = async (
    id: string,
    enabled: boolean
): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const tableName = getPriceTrackScheduledItemsTableName();
        console.log(`Toggling enabled status for price track item with id: ${id} to ${enabled}`);
        console.log('Table name:', tableName);
        console.log('Input types - id:', typeof id, 'enabled:', typeof enabled);

        if (!id || typeof id !== 'string' || id.trim() === '') {
            console.error('Invalid id provided:', id);
            return { success: false, message: 'Invalid id provided' };
        }

        const enabledValue = enabled ? "true" : "false";
        console.log('Will set enabled to:', enabledValue);

        // Update the 'enabled' attribute of the item with the given id
        const updateCommand = {
            TableName: tableName,
            Key: {
                id: id.trim()
            },
            UpdateExpression: "SET enabled = :enabled",
            ExpressionAttributeValues: {
                ":enabled": enabledValue // Store as string for DynamoDB
            },
            ConditionExpression: "attribute_exists(id)", // Ensure the item exists
            ReturnValues: "UPDATED_NEW" as const
        };
        
        console.log('UpdateCommand params:', JSON.stringify(updateCommand, null, 2));
        
        const updateResult = await ddb.send(new UpdateCommand(updateCommand));

        console.log('Update operation result:', JSON.stringify(updateResult, null, 2));
        return { success: true, message: `Successfully updated enabled status for item with id: ${id}` };
    } catch (err) {
        console.error("Error toggling enabled status for price track item:", err);
        return { success: false, error: JSON.stringify(err) };
    }
}
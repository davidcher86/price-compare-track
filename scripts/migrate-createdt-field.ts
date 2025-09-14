// Migration script to fix createDt -> createdDt field name
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(client);

const migratePriceTrackScheduledItems = async () => {
    const tableName = process.env.PRICE_TRACK_SCHEDULED_ITEMS_TABLE_NAME || '';
    
    try {
        console.log('Starting migration for table:', tableName);
        
        // Scan all items
        const result = await ddb.send(new ScanCommand({
            TableName: tableName
        }));
        
        if (!result.Items) {
            console.log('No items found');
            return;
        }
        
        console.log(`Found ${result.Items.length} items to migrate`);
        
        // Process each item
        for (const item of result.Items) {
            if (item.createDt && !item.createdDt) {
                console.log(`Migrating item ${item.id}: ${item.createDt} -> createdDt`);
                
                // Update the item to add createdDt and remove createDt
                await ddb.send(new UpdateCommand({
                    TableName: tableName,
                    Key: { id: item.id },
                    UpdateExpression: 'SET createdDt = :createdDt REMOVE createDt',
                    ExpressionAttributeValues: {
                        ':createdDt': item.createDt
                    }
                }));
                
                console.log(`Successfully migrated item ${item.id}`);
            }
        }
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

// Run migration
migratePriceTrackScheduledItems()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

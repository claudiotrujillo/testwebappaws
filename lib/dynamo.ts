import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
})

export const dynamo = DynamoDBDocumentClient.from(client)
export const TABLE = process.env.DYNAMODB_TABLE_NAME!

export interface AppItem {
    id: string
    name: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
}

export async function getAllItems(): Promise<AppItem[]> {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE }))
    const items = (result.Items as AppItem[]) ?? []
    return items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export async function createItem(
    data: Omit<AppItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AppItem> {
    const now = new Date().toISOString()
    const item: AppItem = {
        id: uuidv4(),
        ...data,
        createdAt: now,
        updatedAt: now,
    }
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }))
    return item
}

export async function updateItem(
    id: string,
    data: Partial<Omit<AppItem, 'id' | 'createdAt'>>
): Promise<void> {
    const now = new Date().toISOString()

    const queryResult = await dynamo.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': id }
    }))

    const existingItem = queryResult.Items?.[0] as AppItem | undefined
    if (!existingItem) {
        throw new Error('Item not found')
    }

    // If the sort key (name) is changing, we must recreate the item
    if (data.name && data.name !== existingItem.name) {
        const newItem = {
            ...existingItem,
            ...data,
            updatedAt: now
        }

        await dynamo.send(new DeleteCommand({
            TableName: TABLE,
            Key: { id, name: existingItem.name }
        }))

        await dynamo.send(new PutCommand({
            TableName: TABLE,
            Item: newItem
        }))
    } else {
        await dynamo.send(
            new UpdateCommand({
                TableName: TABLE,
                Key: { id, name: existingItem.name },
                UpdateExpression:
                    'SET description = :description, #status = :status, updatedAt = :updatedAt',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':description': data.description || existingItem.description,
                    ':status': data.status || existingItem.status,
                    ':updatedAt': now,
                },
            })
        )
    }
}

export async function deleteItem(id: string): Promise<void> {
    const queryResult = await dynamo.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': id }
    }))

    const existingItem = queryResult.Items?.[0]
    if (existingItem) {
        await dynamo.send(new DeleteCommand({
            TableName: TABLE,
            Key: { id, name: existingItem.name }
        }))
    }
}

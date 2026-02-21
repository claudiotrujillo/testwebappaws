import { NextRequest, NextResponse } from 'next/server'
import { getAllItems, createItem } from '@/lib/dynamo'

export async function GET() {
    try {
        const items = await getAllItems()
        return NextResponse.json({ items })
    } catch (error) {
        console.error('Error fetching items:', error)
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, status } = body

        if (!name || !description) {
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
        }

        const item = await createItem({
            name: name.trim(),
            description: description.trim(),
            status: status || 'active',
        })

        return NextResponse.json({ item }, { status: 201 })
    } catch (error) {
        console.error('Error creating item:', error)
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { updateItem, deleteItem } from '@/lib/dynamo'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json()
        const { name, description, status } = body
        const { id } = await params

        if (!name || !description) {
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
        }

        await updateItem(id, {
            name: name.trim(),
            description: description.trim(),
            status: status || 'active',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating item:', error)
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await deleteItem(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting item:', error)
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }
}

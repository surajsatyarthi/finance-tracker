import { NextRequest, NextResponse } from 'next/server'
import { financeManager } from '@/lib/supabaseDataManager'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const message = formData.get('message') as string
        const files = formData.getAll('files') as File[]

        if (!message && files.length === 0) {
            return NextResponse.json({ error: 'Message or file is required' }, { status: 400 })
        }

        const userAgent = req.headers.get('user-agent') || 'Unknown Device'
        const images: string[] = []

        // Process files to Base64 (Limit size to avoid payload issues)
        // 5MB limit roughly
        const MAX_SIZE = 5 * 1024 * 1024

        for (const file of files) {
            if (file.size > MAX_SIZE) {
                console.warn(`File ${file.name} too large, skipping`)
                continue
            }
            if (file.type.startsWith('image/')) {
                const buffer = await file.arrayBuffer()
                const base64 = Buffer.from(buffer).toString('base64')
                const dataUrl = `data:${file.type};base64,${base64}`
                images.push(dataUrl)
            }
        }

        // Submit to Supabase
        const result = await financeManager.submitFeedback(message, userAgent, images)

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Feedback saved' })
        } else {
            return NextResponse.json({ error: result.error || 'Failed to save to database' }, { status: 500 })
        }

    } catch (error) {
        console.error('Error saving feedback:', error)
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }
}

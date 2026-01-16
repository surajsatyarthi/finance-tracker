import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), '..', 'temp_uploads')
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    // Save the uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const filename = `statement_${timestamp}_${file.name}`
    const filepath = path.join(tempDir, filename)

    await writeFile(filepath, buffer)

    // Run the Python extractor
    const extractorPath = path.join(process.cwd(), '..', 'pdf_statement_extractor.py')
    const outputDir = path.join(process.cwd(), '..', 'temp_extracted')

    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    const outputJsonPath = path.join(outputDir, `statement_${timestamp}.json`)

    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${extractorPath}" "${filepath}" "${outputJsonPath}"`
      )

      if (stderr && !stderr.includes('Processed:')) {
        console.error('Python stderr:', stderr)
      }

      // Read the extracted JSON
      const fs = await import('fs/promises')
      const extractedData = JSON.parse(await fs.readFile(outputJsonPath, 'utf-8'))

      // Clean up temp files
      await fs.unlink(filepath).catch(() => {})
      await fs.unlink(outputJsonPath).catch(() => {})

      return NextResponse.json({
        success: true,
        data: extractedData
      })
    } catch (error: any) {
      console.error('Extraction error:', error)
      return NextResponse.json(
        {
          error: 'Failed to extract data from PDF',
          details: error.message
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process upload',
        details: error.message
      },
      { status: 500 }
    )
  }
}

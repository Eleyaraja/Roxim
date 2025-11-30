import * as pdfjsLib from 'pdfjs-dist'

// Set worker path for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export async function parseResume(file: File): Promise<string> {
  const fileType = file.type

  if (fileType === 'application/pdf') {
    return await parsePDF(file)
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') {
    return await parseDOCX(file)
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.')
  }
}

async function parsePDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      text += pageText + '\n'
    }

    return text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF file')
  }
}

async function parseDOCX(file: File): Promise<string> {
  try {
    // For DOCX, we'll use a simple text extraction
    // In production, you'd use mammoth.js or similar
    const text = await file.text()
    return text
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

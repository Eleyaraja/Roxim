/**
 * PDF Parser - Extracts text from PDF files
 */

export async function parsePDFFile(file: File): Promise<string> {
  try {
    // For browser environment, we need to use a different approach
    // pdf-parse works in Node.js, but in browser we need pdf.js or similar
    
    // For now, let's try to read as text and if it's PDF, extract what we can
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Check if it's a PDF
    const isPDF = uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46
    
    if (!isPDF) {
      // Not a PDF, read as text
      const text = await file.text()
      return text
    }
    
    // It's a PDF - extract text using simple regex patterns
    // This is a basic extraction, not perfect but works for simple PDFs
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
    
    // Extract text between stream markers
    const textContent: string[] = []
    
    // Look for text objects in PDF
    const textRegex = /\(([^)]+)\)/g
    let match
    while ((match = textRegex.exec(text)) !== null) {
      const extracted = match[1]
      // Clean up PDF escape sequences
      const cleaned = extracted
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
      
      if (cleaned.trim().length > 2) {
        textContent.push(cleaned)
      }
    }
    
    // Also try to extract from BT/ET blocks (text blocks in PDF)
    const btRegex = /BT\s+(.*?)\s+ET/gs
    while ((match = btRegex.exec(text)) !== null) {
      const block = match[1]
      const tjRegex = /\[(.*?)\]/g
      let tjMatch
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const content = tjMatch[1].replace(/[()]/g, '').trim()
        if (content.length > 2) {
          textContent.push(content)
        }
      }
    }
    
    const extractedText = textContent.join(' ').trim()
    
    if (extractedText.length < 50) {
      return 'Unable to extract text from PDF. Please use a text file (.txt) or Word document (.docx) instead.'
    }
    
    return extractedText
  } catch (error) {
    console.error('PDF parsing error:', error)
    return 'Error parsing PDF file. Please try a different format.'
  }
}

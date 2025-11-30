// Resume export utilities
import { ResumeData } from './resume-types'

export async function exportToPDF(resumeData: ResumeData, templateId: string): Promise<Blob> {
  // Get the preview element
  const previewElement = document.getElementById('resume-preview')
  
  if (!previewElement) {
    throw new Error('Resume preview not found')
  }

  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    // Capture the resume as canvas with higher quality
    const canvas = await html2canvas(previewElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Fixed width for consistency
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-preview')
        if (clonedElement) {
          // Ensure proper sizing
          clonedElement.style.width = '1200px'
          clonedElement.style.transform = 'scale(1)'
        }
      }
    })

    // PDF dimensions (A4)
    const pdfWidth = 210 // mm
    const pdfHeight = 297 // mm
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    // Handle multi-page PDFs
    if (imgHeight > pdfHeight) {
      let heightLeft = imgHeight
      let position = 0
      const pageHeight = pdfHeight

      // Add first page
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    } else {
      // Single page
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    }

    // Return as blob
    return pdf.output('blob')
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('Failed to export PDF')
  }
}

export async function exportToWord(resumeData: ResumeData): Promise<Blob> {
  // Placeholder for Word export
  // Would use docx library
  throw new Error('Word export not yet implemented')
}

export async function exportToText(resumeData: ResumeData): Promise<Blob> {
  const { personal, experience, education, skills, projects } = resumeData

  let text = ''

  // Header
  text += `${personal.fullName}\n`
  text += `${personal.title}\n`
  text += `\n`
  
  // Contact
  if (personal.email) text += `Email: ${personal.email}\n`
  if (personal.phone) text += `Phone: ${personal.phone}\n`
  if (personal.location) text += `Location: ${personal.location}\n`
  if (personal.linkedin) text += `LinkedIn: ${personal.linkedin}\n`
  if (personal.github) text += `GitHub: ${personal.github}\n`
  if (personal.portfolio) text += `Portfolio: ${personal.portfolio}\n`
  text += `\n`

  // Experience
  if (experience.length > 0) {
    text += `PROFESSIONAL EXPERIENCE\n`
    text += `\n`
    
    experience.forEach(exp => {
      text += `${exp.position}\n`
      text += `${exp.company}`
      if (exp.location) text += ` | ${exp.location}`
      text += `\n`
      text += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`
      
      if (exp.description) {
        text += `${exp.description}\n`
      }
      
      if (exp.bullets.length > 0) {
        exp.bullets.forEach(bullet => {
          if (bullet.trim()) {
            text += `• ${bullet}\n`
          }
        })
      }
      
      text += `\n`
    })
  }

  // Projects
  if (projects.length > 0) {
    text += `PROJECTS\n`
    text += `\n`
    
    projects.forEach(project => {
      text += `${project.name}`
      if (project.date) text += ` | ${project.date}`
      text += `\n`
      
      if (project.techStack.length > 0) {
        text += `Tech Stack: ${project.techStack.join(', ')}\n`
      }
      
      if (project.description) {
        text += `${project.description}\n`
      }
      
      if (project.achievements.length > 0) {
        project.achievements.forEach(achievement => {
          if (achievement.trim()) {
            text += `• ${achievement}\n`
          }
        })
      }
      
      if (project.github) text += `GitHub: ${project.github}\n`
      if (project.demo) text += `Demo: ${project.demo}\n`
      
      text += `\n`
    })
  }

  // Skills
  text += `SKILLS\n`
  text += `\n`
  
  if (skills.programming.length > 0) {
    text += `Programming: ${skills.programming.join(', ')}\n`
  }
  if (skills.frameworks.length > 0) {
    text += `Frameworks: ${skills.frameworks.join(', ')}\n`
  }
  if (skills.tools.length > 0) {
    text += `Tools: ${skills.tools.join(', ')}\n`
  }
  if (skills.soft.length > 0) {
    text += `Soft Skills: ${skills.soft.join(', ')}\n`
  }
  text += `\n`

  // Education
  if (education.length > 0) {
    text += `EDUCATION\n`
    text += `\n`
    
    education.forEach(edu => {
      text += `${edu.degree}`
      if (edu.major) text += ` in ${edu.major}`
      text += `\n`
      text += `${edu.institution}\n`
      text += `${edu.startDate} - ${edu.endDate}`
      if (edu.gpa) text += ` | GPA: ${edu.gpa}`
      text += `\n`
      
      if (edu.achievements.length > 0) {
        edu.achievements.forEach(achievement => {
          if (achievement.trim()) {
            text += `• ${achievement}\n`
          }
        })
      }
      
      text += `\n`
    })
  }

  // Convert to blob
  return new Blob([text], { type: 'text/plain' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportResume(
  resumeData: ResumeData,
  format: 'pdf' | 'word' | 'text',
  templateId: string,
  filename: string
): Promise<void> {
  let blob: Blob
  let extension: string

  switch (format) {
    case 'pdf':
      blob = await exportToPDF(resumeData, templateId)
      extension = 'pdf'
      break
    case 'word':
      blob = await exportToWord(resumeData)
      extension = 'docx'
      break
    case 'text':
      blob = await exportToText(resumeData)
      extension = 'txt'
      break
    default:
      throw new Error('Unsupported format')
  }

  downloadBlob(blob, `${filename}.${extension}`)
}

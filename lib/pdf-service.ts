"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "@/components/ui/use-toast"

// Función para convertir un elemento HTML a PDF con mejor diseño
export async function generatePDF(element: HTMLElement, fileName: string, title = "") {
  try {
    toast({
      title: "Generando PDF",
      description: "Por favor espera mientras se genera el PDF...",
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10 // margen en mm

    // Añadir encabezado con estilo
    pdf.setFillColor(39, 174, 96) // Color verde para ISO 14001
    pdf.rect(0, 0, pdfWidth, 25, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)

    // Título del documento
    const documentTitle = title || "Sistema de Gestión Ambiental - ISO 14001"
    pdf.text(documentTitle, pdfWidth / 2, 15, { align: "center" })

    // Añadir fecha y hora
    pdf.setFontSize(10)
    const date = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    pdf.text(`Generado el: ${date}`, pdfWidth - margin, 22, { align: "right" })

    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor escala para mejor calidad
      useCORS: true,
      logging: false,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const imgWidth = pdfWidth - 2 * margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Si la imagen es más alta que la página, dividirla en múltiples páginas
    let heightLeft = imgHeight
    let position = 0
    let pageNumber = 1

    // Primera página - dejar espacio para el encabezado
    pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight)
    heightLeft -= pdfHeight - 40 // 30 para encabezado + 10 para pie de página

    // Añadir pie de página en la primera página
    addFooter(pdf, pdfWidth, pdfHeight, pageNumber)
    pageNumber++

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      pdf.addPage()

      // Añadir encabezado en cada página
      pdf.setFillColor(39, 174, 96)
      pdf.rect(0, 0, pdfWidth, 25, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.text(documentTitle, pdfWidth / 2, 15, { align: "center" })

      position = heightLeft - imgHeight
      pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 40

      // Añadir pie de página en cada página
      addFooter(pdf, pdfWidth, pdfHeight, pageNumber)
      pageNumber++
    }

    // Guardar el PDF
    pdf.save(fileName)

    toast({
      title: "PDF generado con éxito",
      description: `El archivo ${fileName} ha sido descargado.`,
    })
  } catch (error) {
    console.error("Error al generar PDF:", error)
    toast({
      title: "Error al generar PDF",
      description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
      variant: "destructive",
    })
  }
}

// Función para añadir pie de página
function addFooter(pdf: jsPDF, pdfWidth: number, pdfHeight: number, pageNumber: number) {
  pdf.setFillColor(240, 240, 240)
  pdf.rect(0, pdfHeight - 10, pdfWidth, 10, "F")
  pdf.setTextColor(100, 100, 100)
  pdf.setFontSize(8)
  pdf.text("Sistema de Gestión Ambiental - Norma ISO 14001", 10, pdfHeight - 4)
  pdf.text(`Página ${pageNumber}`, pdfWidth - 10, pdfHeight - 4, { align: "right" })
}

// Función para generar PDF combinado de comparativa y coincidencia con mejor diseño
export async function generateCombinedPDF(
  comparativaElement: HTMLElement,
  coincidenciaElement: HTMLElement,
  fileName: string,
) {
  try {
    toast({
      title: "Generando PDF combinado",
      description: "Por favor espera mientras se genera el PDF...",
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10 // margen en mm
    let pageNumber = 1

    // Añadir encabezado con estilo
    pdf.setFillColor(39, 174, 96) // Color verde para ISO 14001
    pdf.rect(0, 0, pdfWidth, 25, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text("Comparativa y Coincidencia - ISO 14001", pdfWidth / 2, 15, { align: "center" })

    // Añadir fecha y hora
    pdf.setFontSize(10)
    const date = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    pdf.text(`Generado el: ${date}`, pdfWidth - margin, 22, { align: "right" })

    // Título de la sección Comparativa
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.text("Tabla Comparativa", margin, 35)

    // Línea divisoria
    pdf.setDrawColor(39, 174, 96)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 37, pdfWidth - margin, 37)

    // Capturar el primer elemento (comparativa)
    const canvas1 = await html2canvas(comparativaElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    })

    const imgData1 = canvas1.toDataURL("image/png")
    const imgWidth1 = pdfWidth - 2 * margin
    const imgHeight1 = (canvas1.height * imgWidth1) / canvas1.width

    // Añadir la primera imagen
    pdf.addImage(imgData1, "PNG", margin, 40, imgWidth1, imgHeight1)

    // Añadir pie de página en la primera página
    addFooter(pdf, pdfWidth, pdfHeight, pageNumber)
    pageNumber++

    // Añadir una nueva página para el segundo elemento
    pdf.addPage()

    // Añadir encabezado en la segunda página
    pdf.setFillColor(39, 174, 96)
    pdf.rect(0, 0, pdfWidth, 25, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text("Comparativa y Coincidencia - ISO 14001", pdfWidth / 2, 15, { align: "center" })

    // Añadir fecha y hora
    pdf.setFontSize(10)
    pdf.text(`Generado el: ${date}`, pdfWidth - margin, 22, { align: "right" })

    // Título de la sección Coincidencia
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.text("Porcentaje de Coincidencia", margin, 35)

    // Línea divisoria
    pdf.setDrawColor(39, 174, 96)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 37, pdfWidth - margin, 37)

    // Capturar el segundo elemento (coincidencia)
    const canvas2 = await html2canvas(coincidenciaElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    })

    const imgData2 = canvas2.toDataURL("image/png")
    const imgWidth2 = pdfWidth - 2 * margin
    const imgHeight2 = (canvas2.height * imgWidth2) / canvas2.width

    // Añadir la segunda imagen
    pdf.addImage(imgData2, "PNG", margin, 40, imgWidth2, imgHeight2)

    // Añadir pie de página en la segunda página
    addFooter(pdf, pdfWidth, pdfHeight, pageNumber)

    // Guardar el PDF
    pdf.save(fileName)

    toast({
      title: "PDF combinado generado con éxito",
      description: `El archivo ${fileName} ha sido descargado.`,
    })
  } catch (error) {
    console.error("Error al generar PDF combinado:", error)
    toast({
      title: "Error al generar PDF combinado",
      description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
      variant: "destructive",
    })
  }
}

// Nueva función para generar PDF combinado directamente desde los datos
export async function generateDataCombinedPDF(
  interpretacionUsuario: any,
  interpretacionIA: any,
  porcentajeCoincidencia: number,
  resultadoCoincidencia: any,
  fileName: string,
) {
  try {
    toast({
      title: "Generando PDF combinado",
      description: "Por favor espera mientras se genera el PDF...",
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10 // margen en mm
    let pageNumber = 1
    let yPosition = 40 // Posición inicial después del encabezado

    // Función para añadir encabezado
    const addHeader = (title: string) => {
      pdf.setFillColor(39, 174, 96) // Color verde para ISO 14001
      pdf.rect(0, 0, pdfWidth, 25, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.text(title, pdfWidth / 2, 15, { align: "center" })

      // Añadir fecha y hora
      pdf.setFontSize(10)
      const date = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      pdf.text(`Generado el: ${date}`, pdfWidth - margin, 22, { align: "right" })
    }

    // Función para añadir texto con salto de línea automático
    const addWrappedText = (text: string, y: number, maxWidth: number, lineHeight: number) => {
      const lines = pdf.splitTextToSize(text, maxWidth)
      pdf.text(lines, margin, y)
      return y + lineHeight * lines.length
    }

    // Añadir encabezado a la primera página
    addHeader("Comparativa y Coincidencia - ISO 14001")

    // Título de la sección Comparativa
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.text("Tabla Comparativa", margin, 35)

    // Línea divisoria
    pdf.setDrawColor(39, 174, 96)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 37, pdfWidth - margin, 37)

    // Configurar estilo para el contenido
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Criterios para comparar
    const criterios = [
      {
        nombre: "Fortalezas identificadas",
        pregunta:
          "¿Qué aspectos positivos o fortalezas identificas en la empresa que podrían facilitar la implementación de ISO 14001?",
        usuario: interpretacionUsuario.fortalezas,
        ia: interpretacionIA.fortalezas,
      },
      {
        nombre: "Problemas identificados",
        pregunta:
          "¿Cuáles son los principales problemas ambientales y organizacionales que dificultan la implementación de ISO 14001?",
        usuario: interpretacionUsuario.debilidades,
        ia: interpretacionIA.debilidades,
      },
      {
        nombre: "Requisitos prioritarios",
        pregunta: "¿Qué requisitos de la norma ISO 14001 serían prioritarios para abordar los problemas identificados?",
        usuario: interpretacionUsuario.recomendaciones,
        ia: interpretacionIA.recomendaciones,
      },
      {
        nombre: "Acciones recomendadas",
        pregunta: "¿Qué acciones recomendarías para implementar la norma ISO 14001 y resolver esta situación?",
        usuario: interpretacionUsuario.interpretacionCompleta,
        ia: interpretacionIA.analisisCompleto,
      },
    ]

    // Añadir cada criterio a la tabla
    for (const criterio of criterios) {
      // Verificar si necesitamos una nueva página
      if (yPosition > pdfHeight - 30) {
        pdf.addPage()
        pageNumber++
        addHeader("Comparativa y Coincidencia - ISO 14001")
        addFooter(pdf, pdfWidth, pdfHeight, pageNumber)
        yPosition = 40
      }

      // Añadir título del criterio
      pdf.setFont("helvetica", "bold")
      pdf.text(criterio.pregunta, margin, yPosition)
      yPosition += 6

      // Añadir respuesta del usuario
      pdf.setFont("helvetica", "normal")
      pdf.text("Tu respuesta:", margin, yPosition)
      yPosition += 5
      yPosition = addWrappedText(criterio.usuario, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 5

      // Añadir respuesta de la IA
      pdf.text("Respuesta de la IA:", margin, yPosition)
      yPosition += 5
      yPosition = addWrappedText(criterio.ia, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 10
    }

    // Añadir cláusulas
    if (yPosition > pdfHeight - 50) {
      pdf.addPage()
      pageNumber++
      addHeader("Comparativa y Coincidencia - ISO 14001")
      addFooter(pdf, pdfWidth, pdfHeight, pageNumber)
      yPosition = 40
    }

    // Añadir título de cláusulas
    pdf.setFont("helvetica", "bold")
    pdf.text("Cláusulas ISO 14001 consideradas relevantes", margin, yPosition)
    yPosition += 6

    // Añadir cláusulas del usuario
    pdf.setFont("helvetica", "normal")
    pdf.text("Tus cláusulas:", margin, yPosition)
    yPosition += 5
    const clausulasUsuario = interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")
    yPosition = addWrappedText(clausulasUsuario, yPosition, pdfWidth - 2 * margin, 5)
    yPosition += 5

    // Añadir cláusulas de la IA
    pdf.text("Cláusulas de la IA:", margin, yPosition)
    yPosition += 5
    const clausulasIA = interpretacionIA.clausulasRelevantes
      ? interpretacionIA.clausulasRelevantes.map((c: string) => `Cláusula ${c}`).join(", ")
      : "No especificadas"
    yPosition = addWrappedText(clausulasIA, yPosition, pdfWidth - 2 * margin, 5)

    // Añadir pie de página en la primera página
    addFooter(pdf, pdfWidth, pdfHeight, pageNumber)

    // Nueva página para la sección de coincidencia
    pdf.addPage()
    pageNumber++
    addHeader("Comparativa y Coincidencia - ISO 14001")

    // Título de la sección Coincidencia
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.text("Porcentaje de Coincidencia", margin, 35)

    // Línea divisoria
    pdf.setDrawColor(39, 174, 96)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 37, pdfWidth - margin, 37)

    // Configurar estilo para el contenido
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Añadir porcentaje de coincidencia
    yPosition = 45
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)

    // Determinar color según el porcentaje
    let colorTexto = [0, 0, 0] // Negro por defecto
    if (porcentajeCoincidencia >= 80) {
      colorTexto = [39, 174, 96] // Verde para alta coincidencia
    } else if (porcentajeCoincidencia >= 50) {
      colorTexto = [255, 152, 0] // Naranja para media coincidencia
    } else {
      colorTexto = [244, 67, 54] // Rojo para baja coincidencia
    }

    pdf.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
    pdf.text(`Coincidencia: ${porcentajeCoincidencia}%`, pdfWidth / 2, yPosition, { align: "center" })
    yPosition += 10

    // Añadir nivel de coincidencia
    let nivelCoincidencia = "Baja"
    if (porcentajeCoincidencia >= 80) {
      nivelCoincidencia = "Alta"
    } else if (porcentajeCoincidencia >= 50) {
      nivelCoincidencia = "Media"
    }

    pdf.text(`Nivel de coincidencia: ${nivelCoincidencia}`, pdfWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Volver al color normal para el resto del contenido
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Añadir explicación si existe
    if (resultadoCoincidencia && resultadoCoincidencia.explicacion) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Explicación:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(resultadoCoincidencia.explicacion, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 10
    }

    // Añadir puntos coincidentes si existen
    if (resultadoCoincidencia && resultadoCoincidencia.puntosCoincidentes) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Puntos coincidentes:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(resultadoCoincidencia.puntosCoincidentes, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 10
    }

    // Añadir puntos divergentes si existen
    if (resultadoCoincidencia && resultadoCoincidencia.puntosDivergentes) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Puntos divergentes:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(resultadoCoincidencia.puntosDivergentes, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 10
    }

    // Añadir coincidencia en cláusulas si existe
    if (resultadoCoincidencia && resultadoCoincidencia.coincidenciaClausulas) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Coincidencia en cláusulas ISO 14001:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(resultadoCoincidencia.coincidenciaClausulas, yPosition, pdfWidth - 2 * margin, 5)
      yPosition += 10
    }

    // Añadir conclusión
    pdf.setFont("helvetica", "bold")
    pdf.text("Conclusión:", margin, yPosition)
    yPosition += 5
    pdf.setFont("helvetica", "normal")
    const conclusion =
      "Este ejercicio demuestra cómo diferentes perspectivas pueden enriquecer la implementación de la norma ISO 14001. Tanto tu análisis como el de la IA ofrecen puntos de vista valiosos que, en conjunto, pueden mejorar significativamente la gestión ambiental de una organización."
    yPosition = addWrappedText(conclusion, yPosition, pdfWidth - 2 * margin, 5)

    // Añadir pie de página en la segunda página
    addFooter(pdf, pdfWidth, pdfHeight, pageNumber)

    // Guardar el PDF
    pdf.save(fileName)

    toast({
      title: "PDF combinado generado con éxito",
      description: `El archivo ${fileName} ha sido descargado.`,
    })
  } catch (error) {
    console.error("Error al generar PDF combinado:", error)
    toast({
      title: "Error al generar PDF combinado",
      description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
      variant: "destructive",
    })
  }
}

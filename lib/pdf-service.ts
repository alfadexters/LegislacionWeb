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
    const margin = 15 // Aumentado el margen para mejor legibilidad
    const contentWidth = pdfWidth - 2 * margin

    // Añadir encabezado con estilo
    const addHeader = (pageTitle = title) => {
      pdf.setFillColor(39, 174, 96) // Color verde para ISO 14001
      pdf.rect(0, 0, pdfWidth, 25, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)

      // Título del documento
      const documentTitle = pageTitle || "Sistema de Gestión Ambiental - ISO 14001"
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
    }

    // Función para añadir pie de página
    const addFooter = (pageNumber: number) => {
      pdf.setFillColor(240, 240, 240)
      pdf.rect(0, pdfHeight - 10, pdfWidth, 10, "F")
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text("Sistema de Gestión Ambiental - Norma ISO 14001", 10, pdfHeight - 4)
      pdf.text(`Página ${pageNumber}`, pdfWidth - 10, pdfHeight - 4, { align: "right" })
    }

    // Capturar el elemento como imagen con mejor calidad
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor escala para mejor calidad
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff", // Fondo blanco para evitar transparencias
    })

    const imgData = canvas.toDataURL("image/png")

    // Calcular dimensiones de la imagen manteniendo la proporción
    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Inicializar variables para el manejo de páginas
    let heightLeft = imgHeight
    let position = 0
    let pageNumber = 1

    // Primera página - dejar espacio para el encabezado
    addHeader()

    // Espacio disponible en la primera página (considerando encabezado y pie de página)
    const firstPageAvailableHeight = pdfHeight - 40 // 25 para encabezado + 15 para pie de página

    // Si la imagen cabe en la primera página
    if (imgHeight <= firstPageAvailableHeight) {
      pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight)
    } else {
      // Si la imagen es más alta, mostrar solo la parte que cabe en la primera página
      pdf.addImage(imgData, "PNG", margin, 30, imgWidth, firstPageAvailableHeight)
      heightLeft -= firstPageAvailableHeight
      position = firstPageAvailableHeight
    }

    // Añadir pie de página en la primera página
    addFooter(pageNumber)

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      pageNumber++
      pdf.addPage()

      // Añadir encabezado en cada página
      addHeader()

      // Espacio disponible en las páginas siguientes
      const pageAvailableHeight = pdfHeight - 40

      // Si el contenido restante cabe en esta página
      if (heightLeft <= pageAvailableHeight) {
        // Mostrar el resto de la imagen
        pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight)
      } else {
        // Si aún queda más contenido para páginas adicionales
        pdf.addImage(imgData, "PNG", margin, 30, imgWidth, pageAvailableHeight)
        position += pageAvailableHeight
      }

      heightLeft -= pageAvailableHeight

      // Añadir pie de página en cada página
      addFooter(pageNumber)
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

// Nueva función mejorada para generar PDF directamente desde datos estructurados
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
    const margin = 15 // Margen aumentado para mejor legibilidad
    const contentWidth = pdfWidth - 2 * margin
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

    // Función para añadir pie de página
    const addFooter = (pageNumber: number) => {
      pdf.setFillColor(240, 240, 240)
      pdf.rect(0, pdfHeight - 10, pdfWidth, 10, "F")
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text("Sistema de Gestión Ambiental - Norma ISO 14001", margin, pdfHeight - 4)
      pdf.text(`Página ${pageNumber}`, pdfWidth - margin, pdfHeight - 4, { align: "right" })
    }

    // Función mejorada para añadir texto con salto de línea automático y control de página
    const addWrappedText = (text: string, y: number, maxWidth: number, lineHeight: number, fontStyle = "normal") => {
      pdf.setFont("helvetica", fontStyle)

      // Asegurar que el texto no sea undefined o null
      const safeText = text || ""

      // Dividir el texto en líneas según el ancho máximo
      const lines = pdf.splitTextToSize(safeText, maxWidth)

      let currentY = y
      for (let i = 0; i < lines.length; i++) {
        // Verificar si necesitamos una nueva página
        if (currentY > pdfHeight - 20) {
          addFooter(pageNumber)
          pdf.addPage()
          pageNumber++
          addHeader("Comparativa y Coincidencia - ISO 14001")
          currentY = 40 // Reiniciar posición Y después del encabezado
        }

        // Asegurar que el texto sea visible (no blanco sobre blanco)
        pdf.setTextColor(0, 0, 0)
        pdf.text(lines[i], margin, currentY)
        currentY += lineHeight
      }

      return currentY
    }

    // Función mejorada para añadir sección con título
    const addSection = (title: string, content: string, bgColor: number[] = [245, 245, 245]) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pdfHeight - 40) {
        addFooter(pageNumber)
        pdf.addPage()
        pageNumber++
        addHeader("Comparativa y Coincidencia - ISO 14001")
        yPosition = 40
      }

      // Añadir título de sección con fondo coloreado
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      pdf.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, "F")

      // Asegurar que el texto del título sea visible sobre el fondo
      pdf.setTextColor(50, 50, 50)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text(title, margin + 5, yPosition)
      yPosition += 10

      // Añadir contenido con color de texto negro para asegurar visibilidad
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      // Asegurar que el contenido no sea undefined o null
      const safeContent = content || ""
      yPosition = addWrappedText(safeContent, yPosition, contentWidth, 5)
      yPosition += 10 // Espacio después de la sección

      return yPosition
    }

    // Añadir encabezado a la primera página
    addHeader("Comparativa y Coincidencia - ISO 14001")

    // Título de la sección Comparativa con estilo mejorado
    pdf.setFillColor(39, 174, 96, 0.1) // Verde claro con transparencia
    pdf.roundedRect(margin, 30, contentWidth, 10, 3, 3, "F")
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("Tabla Comparativa", margin + 5, 37)
    yPosition = 45

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
        usuario: interpretacionUsuario.fortalezas || "",
        ia: interpretacionIA.fortalezas || "",
        bgColor: [230, 247, 230], // Verde muy claro
      },
      {
        nombre: "Problemas identificados",
        pregunta:
          "¿Cuáles son los principales problemas ambientales y organizacionales que dificultan la implementación de ISO 14001?",
        usuario: interpretacionUsuario.debilidades || "",
        ia: interpretacionIA.debilidades || "",
        bgColor: [252, 232, 232], // Rojo muy claro
      },
      {
        nombre: "Requisitos prioritarios",
        pregunta: "¿Qué requisitos de la norma ISO 14001 serían prioritarios para abordar los problemas identificados?",
        usuario: interpretacionUsuario.recomendaciones || "",
        ia: interpretacionIA.recomendaciones || "",
        bgColor: [232, 240, 254], // Azul muy claro
      },
      {
        nombre: "Acciones recomendadas",
        pregunta: "¿Qué acciones recomendarías para implementar la norma ISO 14001 y resolver esta situación?",
        usuario: interpretacionUsuario.interpretacionCompleta || "",
        ia: interpretacionIA.analisisCompleto || "",
        bgColor: [240, 240, 240], // Gris claro
      },
    ]

    // Añadir cada criterio a la tabla con mejor formato
    for (const criterio of criterios) {
      // Verificar si necesitamos una nueva página
      if (yPosition > pdfHeight - 60) {
        addFooter(pageNumber)
        pdf.addPage()
        pageNumber++
        addHeader("Comparativa y Coincidencia - ISO 14001")
        yPosition = 40
      }

      // Añadir título del criterio con fondo coloreado
      pdf.setFillColor(criterio.bgColor[0], criterio.bgColor[1], criterio.bgColor[2])
      pdf.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(50, 50, 50)

      // Dividir la pregunta en múltiples líneas si es necesario para evitar truncamiento
      const preguntaLines = pdf.splitTextToSize(criterio.pregunta, contentWidth - 10)
      pdf.text(preguntaLines, margin + 5, yPosition)

      // Ajustar la posición Y basado en el número de líneas de la pregunta
      yPosition += 5 + preguntaLines.length * 5

      // Añadir respuesta del usuario
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(80, 80, 80)
      pdf.text("Tu respuesta:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
      yPosition = addWrappedText(criterio.usuario, yPosition, contentWidth - 5, 5)
      yPosition += 5

      // Añadir respuesta de la IA
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(80, 80, 80)
      pdf.text("Respuesta de la IA:", margin, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
      yPosition = addWrappedText(criterio.ia, yPosition, contentWidth - 5, 5)
      yPosition += 10
    }

    // Añadir cláusulas con mejor formato
    if (yPosition > pdfHeight - 50) {
      addFooter(pageNumber)
      pdf.addPage()
      pageNumber++
      addHeader("Comparativa y Coincidencia - ISO 14001")
      yPosition = 40
    }

    // Añadir título de cláusulas con estilo
    pdf.setFillColor(230, 230, 250) // Lavanda claro
    pdf.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(50, 50, 50)
    pdf.text("Cláusulas ISO 14001 consideradas relevantes", margin + 5, yPosition)
    yPosition += 10

    // Añadir cláusulas del usuario
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(80, 80, 80)
    pdf.text("Tus cláusulas:", margin, yPosition)
    yPosition += 5
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
    const clausulasUsuario =
      interpretacionUsuario.clausulas && interpretacionUsuario.clausulas.length > 0
        ? interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")
        : "No especificadas"
    yPosition = addWrappedText(clausulasUsuario, yPosition, contentWidth - 5, 5)
    yPosition += 5

    // Añadir cláusulas de la IA
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(80, 80, 80)
    pdf.text("Cláusulas de la IA:", margin, yPosition)
    yPosition += 5
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
    const clausulasIA =
      interpretacionIA.clausulasRelevantes && interpretacionIA.clausulasRelevantes.length > 0
        ? interpretacionIA.clausulasRelevantes.map((c: string) => `Cláusula ${c}`).join(", ")
        : "No especificadas"
    yPosition = addWrappedText(clausulasIA, yPosition, contentWidth - 5, 5)
    yPosition += 10

    // Añadir pie de página en la primera página
    addFooter(pageNumber)

    // Nueva página para la sección de coincidencia
    pdf.addPage()
    pageNumber++
    addHeader("Comparativa y Coincidencia - ISO 14001")

    // Título de la sección Coincidencia con estilo mejorado
    pdf.setFillColor(39, 174, 96, 0.1) // Verde claro con transparencia
    pdf.roundedRect(margin, 30, contentWidth, 10, 3, 3, "F")
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("Porcentaje de Coincidencia", margin + 5, 37)
    yPosition = 45

    // Configurar estilo para el contenido
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Añadir porcentaje de coincidencia con estilo visual mejorado
    pdf.setFillColor(240, 240, 240)
    pdf.roundedRect(margin, yPosition - 5, contentWidth, 25, 5, 5, "F")

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)

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
    pdf.text(`Coincidencia: ${porcentajeCoincidencia}%`, pdfWidth / 2, yPosition + 5, { align: "center" })

    // Añadir nivel de coincidencia
    let nivelCoincidencia = "Baja"
    if (porcentajeCoincidencia >= 80) {
      nivelCoincidencia = "Alta"
    } else if (porcentajeCoincidencia >= 50) {
      nivelCoincidencia = "Media"
    }

    pdf.text(`Nivel de coincidencia: ${nivelCoincidencia}`, pdfWidth / 2, yPosition + 15, { align: "center" })
    yPosition += 30

    // Volver al color normal para el resto del contenido
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    // Añadir explicación si existe
    if (resultadoCoincidencia && resultadoCoincidencia.explicacion) {
      yPosition = addSection("Explicación:", resultadoCoincidencia.explicacion, [230, 247, 230])
    }

    // Añadir puntos coincidentes si existen
    if (resultadoCoincidencia && resultadoCoincidencia.puntosCoincidentes) {
      yPosition = addSection("Puntos coincidentes:", resultadoCoincidencia.puntosCoincidentes, [230, 247, 230])
    }

    // Añadir puntos divergentes si existen
    if (resultadoCoincidencia && resultadoCoincidencia.puntosDivergentes) {
      yPosition = addSection("Puntos divergentes:", resultadoCoincidencia.puntosDivergentes, [252, 232, 232])
    }

    // Añadir coincidencia en cláusulas si existe
    if (resultadoCoincidencia && resultadoCoincidencia.coincidenciaClausulas) {
      yPosition = addSection(
        "Coincidencia en cláusulas ISO 14001:",
        resultadoCoincidencia.coincidenciaClausulas,
        [230, 230, 250],
      )
    }

    // Añadir conclusión con estilo
    pdf.setFillColor(232, 240, 254) // Azul muy claro
    pdf.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(50, 50, 50)
    pdf.text("Conclusión:", margin + 5, yPosition)
    yPosition += 10

    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
    const conclusion =
      "Este ejercicio demuestra cómo diferentes perspectivas pueden enriquecer la implementación de la norma ISO 14001. Tanto tu análisis como el de la IA ofrecen puntos de vista valiosos que, en conjunto, pueden mejorar significativamente la gestión ambiental de una organización."
    yPosition = addWrappedText(conclusion, yPosition, contentWidth, 5)

    // Añadir pie de página en la segunda página
    addFooter(pageNumber)

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

// Nueva función para generar PDF del plan de implementación con formato mejorado
export async function generatePlanPDF(planImplementacion: any, fileName: string) {
  try {
    toast({
      title: "Generando PDF del Plan",
      description: "Por favor espera mientras se genera el PDF...",
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 15 // Margen aumentado para mejor legibilidad
    const contentWidth = pdfWidth - 2 * margin
    let pageNumber = 1
    let yPosition = 40 // Posición inicial después del encabezado

    // Función para añadir encabezado
    const addHeader = () => {
      pdf.setFillColor(39, 174, 96) // Color verde para ISO 14001
      pdf.rect(0, 0, pdfWidth, 25, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.text("Plan de Implementación ISO 14001", pdfWidth / 2, 15, { align: "center" })

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

    // Función para añadir pie de página
    const addFooter = (pageNumber: number) => {
      pdf.setFillColor(240, 240, 240)
      pdf.rect(0, pdfHeight - 10, pdfWidth, 10, "F")
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text("Sistema de Gestión Ambiental - Norma ISO 14001", margin, pdfHeight - 4)
      pdf.text(`Página ${pageNumber}`, pdfWidth - margin, pdfHeight - 4, { align: "right" })
    }

    // Función mejorada para añadir texto con salto de línea automático y control de página
    const addWrappedText = (text: string, y: number, maxWidth: number, lineHeight: number, fontStyle = "normal") => {
      pdf.setFont("helvetica", fontStyle)

      // Asegurar que el texto no sea undefined o null
      const safeText = text || ""

      // Dividir el texto en líneas según el ancho máximo
      const lines = pdf.splitTextToSize(safeText, maxWidth)

      let currentY = y
      for (let i = 0; i < lines.length; i++) {
        // Verificar si necesitamos una nueva página
        if (currentY > pdfHeight - 20) {
          addFooter(pageNumber)
          pdf.addPage()
          pageNumber++
          addHeader()
          currentY = 40 // Reiniciar posición Y después del encabezado
        }

        // Asegurar que el texto sea visible (no blanco sobre blanco)
        pdf.setTextColor(0, 0, 0)
        pdf.text(lines[i], margin, currentY)
        currentY += lineHeight
      }

      return currentY
    }

    // Función mejorada para añadir sección con título y color de fondo
    const addSection = (title: string, content: string, bgColor: number[] = [245, 245, 245]) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pdfHeight - 40) {
        addFooter(pageNumber)
        pdf.addPage()
        pageNumber++
        addHeader()
        yPosition = 40
      }

      // Añadir título de sección con estilo
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      pdf.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, "F")
      pdf.setTextColor(50, 50, 50)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)

      // Dividir el título en múltiples líneas si es necesario
      const titleLines = pdf.splitTextToSize(title, contentWidth - 10)
      pdf.text(titleLines, margin + 5, yPosition)

      // Ajustar la posición Y basado en el número de líneas del título
      yPosition += 5 + (titleLines.length - 1) * 5

      // Añadir contenido con color de texto negro para asegurar visibilidad
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      // Asegurar que el contenido no sea undefined o null
      const safeContent = content || ""
      yPosition = addWrappedText(safeContent, yPosition, contentWidth, 5)
      yPosition += 10 // Espacio después de la sección

      return yPosition
    }

    // Añadir encabezado a la primera página
    addHeader()

    // Añadir título principal con estilo
    pdf.setFillColor(39, 174, 96, 0.1) // Verde claro con transparencia
    pdf.roundedRect(margin, 30, contentWidth, 10, 3, 3, "F")
    pdf.setTextColor(39, 174, 96)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("Plan Detallado de Implementación", margin + 5, 37)
    yPosition = 45

    // Añadir secciones del plan con diferentes colores de fondo para mejor distinción visual
    if (planImplementacion.objetivos) {
      yPosition = addSection("1. Objetivos", planImplementacion.objetivos, [230, 247, 230]) // Verde claro
    }

    if (planImplementacion.acciones) {
      yPosition = addSection("2. Acciones", planImplementacion.acciones, [232, 240, 254]) // Azul claro
    }

    if (planImplementacion.recursos) {
      yPosition = addSection("3. Recursos Necesarios", planImplementacion.recursos, [230, 230, 250]) // Lavanda claro
    }

    if (planImplementacion.cronograma) {
      yPosition = addSection("4. Cronograma de Implementación", planImplementacion.cronograma, [255, 243, 224]) // Naranja claro
    }

    if (planImplementacion.indicadores) {
      yPosition = addSection("5. Indicadores de Seguimiento", planImplementacion.indicadores, [225, 245, 254]) // Celeste claro
    }

    // Añadir pie de página
    addFooter(pageNumber)

    // Si el plan completo es muy extenso, añadirlo en páginas adicionales
    if (planImplementacion.planCompleto) {
      pdf.addPage()
      pageNumber++
      addHeader()

      // Título para el plan completo
      pdf.setFillColor(39, 174, 96, 0.1) // Verde claro con transparencia
      pdf.roundedRect(margin, 30, contentWidth, 10, 3, 3, "F")
      pdf.setTextColor(39, 174, 96)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Plan Completo de Implementación", margin + 5, 37)
      yPosition = 45

      // Añadir el plan completo con formato mejorado
      pdf.setTextColor(0, 0, 0) // Asegurar texto negro para visibilidad
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      // Asegurar que el plan completo no sea undefined o null
      const safePlanCompleto = planImplementacion.planCompleto || ""
      yPosition = addWrappedText(safePlanCompleto, yPosition, contentWidth, 5)

      // Añadir pie de página
      addFooter(pageNumber)
    }

    // Guardar el PDF
    pdf.save(fileName)

    toast({
      title: "PDF del plan generado con éxito",
      description: `El archivo ${fileName} ha sido descargado.`,
    })
  } catch (error) {
    console.error("Error al generar PDF del plan:", error)
    toast({
      title: "Error al generar PDF del plan",
      description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
      variant: "destructive",
    })
  }
}

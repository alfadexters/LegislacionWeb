"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Inicializar el cliente de Google Generative AI
const getAIClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API key no configurada")
  }

  return new GoogleGenerativeAI(apiKey)
}

export async function generarCasoEstudio(apiKey: string) {
  try {
    const genAI = getAIClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Genera un caso de estudio detallado (500-700 palabras) sobre una empresa que enfrenta problemas ambientales significativos y necesita implementar la norma ISO 14001 para resolverlos.

    El caso debe incluir:
    1. Contexto detallado de la empresa (sector, tamaño, ubicación, historia)
    2. Problemas ambientales específicos que enfrenta (emisiones, residuos, consumo de recursos, cumplimiento legal)
    3. Desafíos organizacionales (resistencia al cambio, falta de recursos, conocimiento limitado)
    4. Impactos negativos actuales (multas, imagen pública, pérdida de mercado)
    5. Intentos previos fallidos de solucionar estos problemas
    6. Expectativas de las partes interesadas (clientes, comunidad, reguladores)
    
    El caso debe presentar una situación compleja que requiera un análisis profundo y soluciones basadas en ISO 14001.
    NO incluyas soluciones en el caso, solo la problemática.
    Escribe el texto en español con un estilo profesional y detallado.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error al generar caso de estudio:", error)
    throw error
  }
}

export async function analizarCasoEstudio(casoEstudio: string, interpretacionUsuario: any, apiKey: string) {
  try {
    const genAI = getAIClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Analiza este caso de estudio según la norma ISO 14001 y responde a las preguntas planteadas por el usuario.
    
    Caso de estudio: ${casoEstudio}
    
    Preguntas del usuario:
    - Fortalezas: ${interpretacionUsuario.fortalezas}
    - Debilidades: ${interpretacionUsuario.debilidades}
    - Recomendaciones: ${interpretacionUsuario.recomendaciones}
    - Pregunta final: ${interpretacionUsuario.interpretacionCompleta}
    - Cláusulas relevantes seleccionadas por el usuario: ${interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")}
    
    Proporciona tu análisis en formato JSON con la siguiente estructura:
    {
      "fortalezas": "Respuesta detallada a la pregunta sobre fortalezas",
      "debilidades": "Respuesta detallada a la pregunta sobre debilidades",
      "recomendaciones": "Respuesta detallada a la pregunta sobre recomendaciones",
      "analisisCompleto": "Respuesta completa a la pregunta final sobre acciones recomendadas para implementar ISO 14001 y resolver la situación (300-400 palabras)",
      "clausulasRelevantes": ["4", "5", "6", "7", "8", "9", "10"] // Incluye solo los números de las cláusulas que consideres relevantes para este caso
    }
    
    Para las cláusulas relevantes, elige las que mejor se apegan al caso de estudio, son las siguientes cláusulas de ISO 14001:
    - 4. Contexto de la organización
    - 5. Liderazgo
    - 6. Planificación
    - 7. Apoyo
    - 8. Operación
    - 9. Evaluación del desempeño
    - 10. Mejora
    
    Asegúrate de que el análisis sea detallado, específico para ISO 14001, y proporcione soluciones prácticas basadas en la norma.
    Escribe el análisis en español.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extraer el JSON de la respuesta
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    } else {
      try {
        return JSON.parse(text)
      } catch (e) {
        throw new Error("No se pudo extraer el análisis en formato JSON")
      }
    }
  } catch (error) {
    console.error("Error al analizar caso de estudio:", error)
    throw error
  }
}

export async function calcularPorcentajeCoincidencia(
  interpretacionUsuario: any,
  interpretacionIA: any,
  apiKey: string,
) {
  try {
    const genAI = getAIClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Compara estas dos interpretaciones de un caso de estudio sobre ISO 14001 y calcula un porcentaje de coincidencia basado en la similitud de las ideas, soluciones propuestas y cláusulas relevantes identificadas.
    
    Interpretación del usuario:
    - Respuesta a la pregunta final: ${interpretacionUsuario.interpretacionCompleta}
    - Cláusulas relevantes: ${interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")}
    
    Interpretación de la IA:
    - Respuesta a la pregunta final: ${interpretacionIA.analisisCompleto}
    - Cláusulas relevantes: ${interpretacionIA.clausulasRelevantes ? interpretacionIA.clausulasRelevantes.map((c: string) => `Cláusula ${c}`).join(", ") : "No especificadas"}
    
    Proporciona tu análisis en formato JSON con la siguiente estructura:
    {
      "porcentaje": número entre 0 y 100,
      "explicacion": "Breve explicación de la coincidencia",
      "puntosCoincidentes": "Lista de puntos donde coinciden las soluciones propuestas",
      "puntosDivergentes": "Lista de puntos donde difieren las soluciones propuestas",
      "coincidenciaClausulas": "Análisis de la coincidencia en las cláusulas identificadas como relevantes"
    }
    
    Asegúrate de que el análisis sea objetivo y basado en el contenido de ambas interpretaciones.
    Escribe el análisis en español.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extraer el JSON de la respuesta
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    } else {
      try {
        return JSON.parse(text)
      } catch (e) {
        throw new Error("No se pudo extraer el análisis en formato JSON")
      }
    }
  } catch (error) {
    console.error("Error al calcular porcentaje de coincidencia:", error)
    throw error
  }
}

// Modificar esta función para manejar mejor el formato JSON y evitar errores de caracteres de control
export async function generarPlanImplementacion(
  casoEstudio: string,
  interpretacionUsuario: any,
  interpretacionIA: any,
  apiKey: string,
) {
  try {
    const genAI = getAIClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Genera un plan detallado de implementación de la norma ISO 14001 para el siguiente caso de estudio, basándote en el análisis del usuario y de la IA.
    
    Caso de estudio: ${casoEstudio}
    
    Análisis del usuario:
    - Fortalezas: ${interpretacionUsuario.fortalezas}
    - Debilidades: ${interpretacionUsuario.debilidades}
    - Recomendaciones: ${interpretacionUsuario.recomendaciones}
    - Cláusulas relevantes: ${interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")}
    - Acciones recomendadas: ${interpretacionUsuario.interpretacionCompleta}
    
    Análisis de la IA:
    - Fortalezas: ${interpretacionIA.fortalezas}
    - Debilidades: ${interpretacionIA.debilidades}
    - Recomendaciones: ${interpretacionIA.recomendaciones}
    - Cláusulas relevantes: ${interpretacionIA.clausulasRelevantes ? interpretacionIA.clausulasRelevantes.map((c: string) => `Cláusula ${c}`).join(", ") : "No especificadas"}
    - Acciones recomendadas: ${interpretacionIA.analisisCompleto}
    
    Proporciona un plan de implementación con la siguiente estructura:
    
    1. Objetivos: Objetivos claros y medibles para la implementación de ISO 14001
    2. Acciones: Acciones específicas organizadas por fases para implementar la norma
    3. Recursos: Recursos humanos, materiales y financieros necesarios
    4. Cronograma: Cronograma de implementación con plazos realistas
    5. Indicadores: Indicadores de seguimiento para medir el progreso
    6. Plan completo: Plan completo que integre todos los elementos anteriores en un documento coherente
    
    Asegúrate de que el plan sea específico para este caso, práctico, realista y alineado con los requisitos de ISO 14001.
    Escribe el plan en español con un estilo profesional y detallado.
    
    Devuelve tu respuesta en formato JSON con esta estructura exacta:
    {
      "objetivos": "texto con los objetivos",
      "acciones": "texto con las acciones",
      "recursos": "texto con los recursos",
      "cronograma": "texto con el cronograma",
      "indicadores": "texto con los indicadores",
      "planCompleto": "texto con el plan completo"
    }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Intentar extraer el JSON de diferentes formas
    try {
      // Primero intentar extraer JSON con formato de código
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        // Limpiar caracteres de control antes de parsear
        const cleanJson = jsonMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        return JSON.parse(cleanJson)
      }

      // Si no hay formato de código, intentar extraer todo el texto como JSON
      const cleanText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      return JSON.parse(cleanText)
    } catch (error) {
      console.error("Error al parsear JSON:", error)

      // Si todo falla, crear un objeto manualmente con el texto recibido
      // Dividir el texto en secciones basadas en encabezados comunes
      const objetivosMatch = text.match(/(?:Objetivos|OBJETIVOS)[:\s]*([\s\S]*?)(?=(?:Acciones|ACCIONES|$))/i)
      const accionesMatch = text.match(/(?:Acciones|ACCIONES)[:\s]*([\s\S]*?)(?=(?:Recursos|RECURSOS|$))/i)
      const recursosMatch = text.match(/(?:Recursos|RECURSOS)[:\s]*([\s\S]*?)(?=(?:Cronograma|CRONOGRAMA|$))/i)
      const cronogramaMatch = text.match(/(?:Cronograma|CRONOGRAMA)[:\s]*([\s\S]*?)(?=(?:Indicadores|INDICADORES|$))/i)
      const indicadoresMatch = text.match(/(?:Indicadores|INDICADORES)[:\s]*([\s\S]*?)(?=(?:Plan|PLAN|$))/i)

      return {
        objetivos: objetivosMatch ? objetivosMatch[1].trim() : "No se pudo extraer los objetivos.",
        acciones: accionesMatch ? accionesMatch[1].trim() : "No se pudo extraer las acciones.",
        recursos: recursosMatch ? recursosMatch[1].trim() : "No se pudo extraer los recursos.",
        cronograma: cronogramaMatch ? cronogramaMatch[1].trim() : "No se pudo extraer el cronograma.",
        indicadores: indicadoresMatch ? indicadoresMatch[1].trim() : "No se pudo extraer los indicadores.",
        planCompleto: text.replace(/```json|```/g, "").trim(),
      }
    }
  } catch (error) {
    console.error("Error al generar plan de implementación:", error)
    throw error
  }
}

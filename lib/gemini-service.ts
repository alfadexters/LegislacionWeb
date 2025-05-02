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

    const prompt = `Conectate a internet  y Genera un caso de estudio real o ficticio de 300-500 palabras sobre una empresa que implementa ISO 14001. 
    Incluye contexto (sector, tamaño, ubicación), problemas ambientales identificados (emisiones, residuos, consumo de recursos), 
    acciones tomadas para cumplir con ISO 14001 (auditorías, políticas, objetivos ambientales) y 
    resultados obtenidos (reducción de impacto ambiental, certificación, etc.). 
    El caso debe ser coherente, relevante para ISO 14001, y no contener información contradictoria. 
    Toma en cuenta que cada que se genere un caso no quiero que se repita mas de 2 o 3 veces el caso
    Escribe el texto en español.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error al generar caso de estudio:", error)
    throw error
  }
}

export async function analizarCasoEstudio(casoEstudio: string, apiKey: string) {
  try {
    const genAI = getAIClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `Analiza este caso de estudio según ISO 14001, identificando fortalezas, debilidades y recomendaciones.
    Caso de estudio: ${casoEstudio}
    
    Proporciona tu análisis en formato JSON con la siguiente estructura:
    {
      "fortalezas": "Lista de fortalezas identificadas",
      "debilidades": "Lista de debilidades o áreas de mejora",
      "recomendaciones": "Recomendaciones específicas para mejorar la implementación",
      "analisisCompleto": "Análisis completo en 200-300 palabras"
    }
    
    Asegúrate de que el análisis sea detallado, específico para ISO 14001, y proporcione recomendaciones prácticas.
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

    const prompt = `Compara estas dos interpretaciones de un caso de estudio sobre ISO 14001 y calcula un porcentaje de coincidencia basado en la similitud de las ideas.
    
    Interpretación del usuario:
    ${interpretacionUsuario.interpretacionCompleta}
    
    Interpretación de la IA:
    ${interpretacionIA.analisisCompleto}
    
    Proporciona tu análisis en formato JSON con la siguiente estructura:
    {
      "porcentaje": número entre 0 y 100,
      "explicacion": "Breve explicación de la coincidencia",
      "puntosCoincidentes": "Lista de puntos donde coinciden",
      "puntosDivergentes": "Lista de puntos donde difieren"
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

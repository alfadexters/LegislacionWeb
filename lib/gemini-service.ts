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

    const prompt = `Genera un caso de estudio detallado (700-900 palabras) sobre una empresa que enfrenta problemas ambientales significativos y necesita implementar la norma ISO 14001 para abordarlos. El caso puede ser completamente ficticio, completamente real o parcialmente real y ficticio. Al inicio del caso, indica claramente si es ficticio, real o mixto (especificando qué partes son reales y cuáles ficticias). Si el caso es real o parcialmente real, realiza una búsqueda en internet y cita las fuentes de información utilizadas (por ejemplo, informes públicos, artículos, sitios web confiables). El caso debe proporcionar la mayor cantidad de datos relevantes para permitir un análisis exhaustivo, presentando una situación compleja que requiera soluciones basadas en la norma ISO 14001, sin incluir dichas soluciones, solo la problemática.

El caso debe incluir:

1. **Contexto detallado de la empresa**: sector industrial o comercial, tamaño (número de empleados, ingresos aproximados), ubicación geográfica (país, región, entorno urbano o rural), historia (origen, años de operación, hitos clave) y estructura organizativa (niveles jerárquicos, departamentos relevantes).
2. **Problemas ambientales específicos**: descripción cuantitativa y cualitativa de los problemas, como emisiones contaminantes (tipo, volumen), gestión inadecuada de residuos (peligrosos o no), consumo excesivo de recursos (agua, energía, materias primas) y/o incumplimiento de regulaciones ambientales locales o internacionales.
3. **Desafíos organizacionales**: barreras internas como resistencia al cambio (cultural o de liderazgo), falta de recursos financieros o humanos, conocimientos limitados sobre gestión ambiental o la norma ISO 14001, y posibles conflictos entre departamentos.
4. **Impactos negativos actuales**: consecuencias concretas, como multas o sanciones (montos, frecuencia), daño a la reputación pública (percepción de clientes o medios), pérdida de cuota de mercado, o restricciones operativas impuestas por reguladores.
5. **Intentos previos fallidos**: iniciativas o programas ambientales anteriores que no lograron resolver los problemas, detallando qué se intentó, por qué fracasó (falta de planificación, ejecución deficiente, etc.) y las lecciones aprendidas, si las hay.
6. **Expectativas de las partes interesadas**: demandas y perspectivas de clientes (exigencias de sostenibilidad), comunidad local (preocupaciones por salud o medio ambiente), reguladores (cumplimiento estricto) y otros actores relevantes (proveedores, ONGs, inversionistas).

El caso debe ser escrito en español, con un estilo profesional, claro y detallado, utilizando datos específicos (números, porcentajes, ejemplos concretos) para enriquecer la narrativa y reflejar la gravedad de la situación. La problemática debe ser lo suficientemente compleja como para requerir un análisis profundo, destacando las interconexiones entre los problemas ambientales, organizacionales y de mercado, y el rol potencial de la norma ISO 14001.`

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

    const prompt = `Analiza el siguiente caso de estudio según la norma ISO 14001 y responde a las preguntas planteadas por el usuario. El caso puede ser ficticio, real o parcialmente real y ficticio, y debe indicar su naturaleza al inicio, con fuentes citadas (obtenidas mediante búsqueda en internet) si es real o parcialmente real.

Caso de estudio: ${casoEstudio}

Preguntas del usuario:
- Fortalezas: ${interpretacionUsuario.fortalezas}
- Debilidades: ${interpretacionUsuario.debilidades}
- Recomendaciones: ${interpretacionUsuario.recomendaciones}
- Pregunta final: ${interpretacionUsuario.interpretacionCompleta}
- Cláusulas relevantes seleccionadas por el usuario: ${interpretacionUsuario.clausulas.map((c: string) => `Cláusula ${c}`).join(", ")}

Proporciona tu análisis en formato JSON con la siguiente estructura:
{
  "fortalezas": "Respuesta detallada a la pregunta sobre fortalezas, identificando aspectos positivos del caso que puedan apoyar la implementación de ISO 14001",
  "debilidades": "Respuesta detallada a la pregunta sobre debilidades, destacando barreras específicas del caso que dificulten el cumplimiento de ISO 14001",
  "recomendaciones": "Respuesta detallada a la pregunta sobre recomendaciones, proponiendo acciones prácticas y específicas alineadas con ISO 14001",
  "analisisCompleto": "Respuesta completa a la pregunta final sobre acciones recomendadas para implementar ISO 14001 y resolver la situación, detallando pasos estratégicos y operativos (300-400 palabras)",
  "clausulasRelevantes": ["4", "5", "6"] // Incluye solo los números de las cláusulas de ISO 14001 que sean más relevantes para abordar los problemas y desafíos del caso, con un máximo de 3-4 cláusulas salvo que el caso justifique más
}

Para las cláusulas relevantes, selecciona estrictamente un máximo de 3-4 cláusulas de ISO 14001 que sean directamente aplicables a los problemas ambientales, desafíos organizacionales y expectativas de las partes interesadas descritos en el caso. **No selecciones todas las cláusulas; prioriza solo las más críticas y pertinentes**. Para cada cláusula seleccionada, proporciona una breve justificación en el análisis que explique cómo aborda un aspecto específico del caso (por ejemplo, un problema ambiental, una barrera organizacional o una expectativa de las partes interesadas). Evita selecciones genéricas o inclusiones innecesarias. Las cláusulas de ISO 14001 son:
- 4. Contexto de la organización
- 5. Liderazgo
- 6. Planificación
- 7. Apoyo
- 8. Operación
- 9. Evaluación del desempeño
- 10. Mejora

Asegúrate de que el análisis sea detallado, específico para ISO 14001, y proporcione soluciones prácticas basadas en la norma, considerando el contexto, problemas y desafíos del caso. Escribe el análisis en español con un estilo profesional y claro.`

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

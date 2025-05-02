import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ valid: false, message: "La clave API es requerida" }, { status: 400 })
    }

    // Intentar inicializar el cliente de Google Generative AI con la clave proporcionada
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Hacer una solicitud simple para verificar si la clave es válida
    try {
      await model.generateContent("Test")
      return NextResponse.json({ valid: true })
    } catch (error: any) {
      console.error("Error al validar la clave API:", error)

      // Verificar si el error es debido a una clave API inválida
      if (error.message?.includes("API key")) {
        return NextResponse.json({ valid: false, message: "La clave API proporcionada no es válida" }, { status: 401 })
      }

      // Otros errores podrían indicar que la clave es válida pero hay otros problemas
      return NextResponse.json(
        { valid: false, message: "Error al validar la clave API: " + error.message },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en la validación de la clave API:", error)
    return NextResponse.json({ valid: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { analizarCasoEstudio } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"

interface InterpretacionIAProps {
  casoEstudio: string
  interpretacionUsuario: {
    fortalezas: string
    debilidades: string
    recomendaciones: string
    clausulas: string[]
    interpretacionCompleta: string
  }
  interpretacionIA: {
    fortalezas: string
    debilidades: string
    recomendaciones: string
    analisisCompleto: string
  }
  setInterpretacionIA: (interpretacion: any) => void
  onComplete: () => void
  apiKey: string
}

export default function InterpretacionIA({
  casoEstudio,
  interpretacionUsuario,
  interpretacionIA,
  setInterpretacionIA,
  onComplete,
  apiKey,
}: InterpretacionIAProps) {
  const [cargando, setCargando] = useState(false)
  const { toast } = useToast()

  const handleGenerarAnalisis = async () => {
    if (!apiKey) {
      toast({
        title: "Clave API requerida",
        description: "Por favor configura tu clave API de Google Gemini primero.",
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)
      const analisis = await analizarCasoEstudio(casoEstudio, apiKey)
      setInterpretacionIA(analisis)
      toast({
        title: "Análisis generado",
        description: "La IA ha generado su análisis del caso de estudio con éxito.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al generar análisis",
        description: "No se pudo generar el análisis. Verifica tu clave API e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interpretación por Inteligencia Artificial</CardTitle>
          <CardDescription>
            La IA analizará el caso de estudio y proporcionará su interpretación según la norma ISO 14001.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
            <h3 className="font-medium mb-2">Tu interpretación (Referencia)</h3>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Fortalezas:</strong> {interpretacionUsuario.fortalezas}
              </p>
              <p className="mb-2">
                <strong>Debilidades:</strong> {interpretacionUsuario.debilidades}
              </p>
              <p className="mb-2">
                <strong>Recomendaciones:</strong> {interpretacionUsuario.recomendaciones}
              </p>
            </div>
          </div>

          <Button onClick={handleGenerarAnalisis} disabled={cargando} className="w-full mb-6">
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando análisis...
              </>
            ) : interpretacionIA.analisisCompleto ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Regenerar análisis
              </>
            ) : (
              "Generar análisis de la IA"
            )}
          </Button>

          {interpretacionIA.analisisCompleto && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Fortalezas identificadas por la IA:</h3>
                <div className="bg-green-50 p-3 rounded-md">{interpretacionIA.fortalezas}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Debilidades identificadas por la IA:</h3>
                <div className="bg-red-50 p-3 rounded-md">{interpretacionIA.debilidades}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recomendaciones de la IA:</h3>
                <div className="bg-blue-50 p-3 rounded-md">{interpretacionIA.recomendaciones}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Análisis completo:</h3>
                <div className="bg-slate-50 p-3 rounded-md">
                  {interpretacionIA.analisisCompleto.split("\n").map((parrafo, index) => (
                    <p key={index} className="mb-2">
                      {parrafo}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {interpretacionIA.analisisCompleto && (
            <Button onClick={onComplete} className="w-full">
              Continuar a tabla comparativa
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

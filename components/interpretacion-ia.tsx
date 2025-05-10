"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, FileDown } from "lucide-react"
import { analizarCasoEstudio } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { generatePDF } from "@/lib/pdf-service"

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
    clausulasRelevantes?: string[]
  }
  setInterpretacionIA: (interpretacion: any) => void
  onComplete: () => void
  apiKey: string
}

const clausulasISO14001 = [
  { id: "4", label: "4. Contexto de la organización" },
  { id: "5", label: "5. Liderazgo" },
  { id: "6", label: "6. Planificación" },
  { id: "7", label: "7. Apoyo" },
  { id: "8", label: "8. Operación" },
  { id: "9", label: "9. Evaluación del desempeño" },
  { id: "10", label: "10. Mejora" },
]

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
  const interpretacionIARef = useRef<HTMLDivElement>(null)

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
      const analisis = await analizarCasoEstudio(casoEstudio, interpretacionUsuario, apiKey)
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

  // Obtener el nombre completo de la cláusula a partir de su ID
  const getClausulaLabel = (id: string) => {
    const clausula = clausulasISO14001.find((c) => c.id === id)
    return clausula ? clausula.label : `Cláusula ${id}`
  }

  const handleDescargarPDF = async () => {
    if (interpretacionIARef.current && interpretacionIA.analisisCompleto) {
      await generatePDF(interpretacionIARef.current, "analisis-ia-iso14001.pdf")
    } else {
      toast({
        title: "Error al descargar",
        description: "No hay análisis de IA para descargar.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Inteligencia Artificial</CardTitle>
          <CardDescription>
            La IA analizará el caso de estudio y responderá a las mismas preguntas que tú has respondido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
            <h3 className="font-medium mb-2">Tus preguntas (Referencia)</h3>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Fortalezas:</strong> {interpretacionUsuario.fortalezas}
              </p>
              <p className="mb-2">
                <strong>Problemas:</strong> {interpretacionUsuario.debilidades}
              </p>
              <p className="mb-2">
                <strong>Requisitos prioritarios:</strong> {interpretacionUsuario.recomendaciones}
              </p>
              <p className="mb-2">
                <strong>Cláusulas relevantes:</strong>{" "}
                {interpretacionUsuario.clausulas.map((clausula) => (
                  <Badge key={clausula} variant="outline" className="mr-1">
                    {getClausulaLabel(clausula)}
                  </Badge>
                ))}
              </p>
              <p className="mb-2">
                <strong>Acciones recomendadas:</strong> {interpretacionUsuario.interpretacionCompleta.substring(0, 150)}
                {interpretacionUsuario.interpretacionCompleta.length > 150 ? "..." : ""}
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
            <div className="space-y-4" ref={interpretacionIARef}>
              <div>
                <h3 className="font-medium mb-2">Respuesta sobre fortalezas:</h3>
                <div className="bg-green-50 p-3 rounded-md">{interpretacionIA.fortalezas}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Respuesta sobre problemas:</h3>
                <div className="bg-red-50 p-3 rounded-md">{interpretacionIA.debilidades}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Respuesta sobre requisitos prioritarios:</h3>
                <div className="bg-blue-50 p-3 rounded-md">{interpretacionIA.recomendaciones}</div>
              </div>

              {interpretacionIA.clausulasRelevantes && interpretacionIA.clausulasRelevantes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Cláusulas ISO 14001 consideradas relevantes:</h3>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {interpretacionIA.clausulasRelevantes.map((clausula) => (
                        <Badge key={clausula} variant="outline" className="bg-white">
                          {getClausulaLabel(clausula)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Acciones recomendadas para implementar ISO 14001:</h3>
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
        <CardFooter className="flex justify-between">
          {interpretacionIA.analisisCompleto && (
            <>
              <Button variant="outline" onClick={handleDescargarPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={onComplete}>Continuar a tabla comparativa</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

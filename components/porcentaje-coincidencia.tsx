"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, FileDown } from "lucide-react"
import { calcularPorcentajeCoincidencia } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { generateDataCombinedPDF } from "@/lib/pdf-service"

interface PorcentajeCoincidenciaProps {
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
  porcentajeCoincidencia: number
  setPorcentajeCoincidencia: (porcentaje: number) => void
  apiKey: string
  onReiniciar: () => void
  onComplete: () => void
}

interface ResultadoCoincidencia {
  porcentaje: number
  explicacion: string
  puntosCoincidentes: string
  puntosDivergentes: string
  coincidenciaClausulas?: string
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

export default function PorcentajeCoincidencia({
  interpretacionUsuario,
  interpretacionIA,
  porcentajeCoincidencia,
  setPorcentajeCoincidencia,
  apiKey,
  onReiniciar,
  onComplete,
}: PorcentajeCoincidenciaProps) {
  const [cargando, setCargando] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCoincidencia | null>(null)
  const { toast } = useToast()

  const getNivelCoincidencia = (porcentaje: number) => {
    if (porcentaje >= 80) return { nivel: "Alta", color: "text-green-600" }
    if (porcentaje >= 50) return { nivel: "Media", color: "text-yellow-600" }
    return { nivel: "Baja", color: "text-red-600" }
  }

  // Obtener el nombre completo de la cláusula a partir de su ID
  const getClausulaLabel = (id: string) => {
    const clausula = clausulasISO14001.find((c) => c.id === id)
    return clausula ? clausula.label : `Cláusula ${id}`
  }

  const handleCalcularCoincidencia = async () => {
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
      const resultadoAnalisis = await calcularPorcentajeCoincidencia(interpretacionUsuario, interpretacionIA, apiKey)
      setResultado(resultadoAnalisis)
      setPorcentajeCoincidencia(resultadoAnalisis.porcentaje)
      toast({
        title: "Análisis completado",
        description: "Se ha calculado el porcentaje de coincidencia con éxito.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al calcular coincidencia",
        description: "No se pudo calcular el porcentaje de coincidencia. Verifica tu clave API e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const handleDescargarCombinado = async () => {
    try {
      setDescargandoPDF(true)

      if (!resultado) {
        throw new Error("No hay resultados de coincidencia para generar el PDF")
      }

      await generateDataCombinedPDF(
        interpretacionUsuario,
        interpretacionIA,
        porcentajeCoincidencia,
        resultado,
        "comparativa-coincidencia-iso14001.pdf",
      )
    } catch (error) {
      console.error("Error al descargar PDF combinado:", error)
      toast({
        title: "Error al descargar",
        description: error instanceof Error ? error.message : "No se pudo generar el PDF combinado.",
        variant: "destructive",
      })
    } finally {
      setDescargandoPDF(false)
    }
  }

  useEffect(() => {
    if (porcentajeCoincidencia > 0 && !resultado) {
      // Si ya tenemos un porcentaje guardado pero no el resultado completo
      setResultado({
        porcentaje: porcentajeCoincidencia,
        explicacion: "Análisis previamente calculado",
        puntosCoincidentes: "Información no disponible para análisis previo",
        puntosDivergentes: "Información no disponible para análisis previo",
      })
    }
  }, [porcentajeCoincidencia, resultado])

  const nivelCoincidencia = getNivelCoincidencia(porcentajeCoincidencia || 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de Coincidencia</CardTitle>
          <CardDescription>
            Comparación entre tu interpretación y la de la IA para determinar el nivel de coincidencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleCalcularCoincidencia} disabled={cargando} className="w-full mb-6">
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando coincidencia...
              </>
            ) : resultado ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Recalcular coincidencia
              </>
            ) : (
              "Calcular porcentaje de coincidencia"
            )}
          </Button>

          {resultado && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Coincidencia: <span className={nivelCoincidencia.color}>{resultado.porcentaje}%</span>
                </h3>
                <p className="text-lg">
                  Nivel de coincidencia: <span className={nivelCoincidencia.color}>{nivelCoincidencia.nivel}</span>
                </p>
                <div className="mt-4">
                  <Progress value={resultado.porcentaje} className="h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Explicación:</h3>
                <div className="bg-slate-50 p-3 rounded-md">{resultado.explicacion}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Puntos coincidentes:</h3>
                <div className="bg-green-50 p-3 rounded-md">{resultado.puntosCoincidentes}</div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Puntos divergentes:</h3>
                <div className="bg-red-50 p-3 rounded-md">{resultado.puntosDivergentes}</div>
              </div>

              {resultado.coincidenciaClausulas && (
                <div>
                  <h3 className="font-medium mb-2">Coincidencia en cláusulas ISO 14001:</h3>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p>{resultado.coincidenciaClausulas}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="mr-4">
                        <p className="text-sm font-medium mb-1">Tus cláusulas:</p>
                        <div className="flex flex-wrap gap-1">
                          {interpretacionUsuario.clausulas.map((clausula) => (
                            <Badge key={clausula} variant="outline" className="bg-white">
                              {getClausulaLabel(clausula)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Cláusulas de la IA:</p>
                        <div className="flex flex-wrap gap-1">
                          {interpretacionIA.clausulasRelevantes && interpretacionIA.clausulasRelevantes.length > 0 ? (
                            interpretacionIA.clausulasRelevantes.map((clausula) => (
                              <Badge key={clausula} variant="outline" className="bg-white">
                                {getClausulaLabel(clausula)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No especificadas</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Conclusión:</h3>
                <p>
                  Este ejercicio demuestra cómo diferentes perspectivas pueden enriquecer la implementación de la norma
                  ISO 14001. Tanto tu análisis como el de la IA ofrecen puntos de vista valiosos que, en conjunto,
                  pueden mejorar significativamente la gestión ambiental de una organización.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            {resultado && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Has completado el análisis de coincidencia. Ahora puedes descargar los resultados o continuar a la
                  planificación.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <Button variant="outline" onClick={handleDescargarCombinado} disabled={descargandoPDF}>
                    {descargandoPDF ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar comparativa y coincidencia
                      </>
                    )}
                  </Button>
                  <Button onClick={onComplete}>Continuar a planificación</Button>
                </div>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

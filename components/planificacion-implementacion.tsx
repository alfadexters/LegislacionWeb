"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Download, FileDown } from "lucide-react"
import { generarPlanImplementacion } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generatePDF } from "@/lib/pdf-service"

interface PlanificacionImplementacionProps {
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
  planImplementacion: {
    objetivos: string
    acciones: string
    recursos: string
    cronograma: string
    indicadores: string
    planCompleto: string
  }
  setPlanImplementacion: (plan: any) => void
  apiKey: string
  onComplete: () => void
  onReiniciar: () => void
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

export default function PlanificacionImplementacion({
  casoEstudio,
  interpretacionUsuario,
  interpretacionIA,
  planImplementacion,
  setPlanImplementacion,
  apiKey,
  onComplete,
  onReiniciar,
}: PlanificacionImplementacionProps) {
  const [cargando, setCargando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [activeTab, setActiveTab] = useState("objetivos")
  const { toast } = useToast()
  const planRef = useRef<HTMLDivElement>(null)
  const planCompletoRef = useRef<HTMLDivElement>(null)

  // Obtener el nombre completo de la cláusula a partir de su ID
  const getClausulaLabel = (id: string) => {
    const clausula = clausulasISO14001.find((c) => c.id === id)
    return clausula ? clausula.label : `Cláusula ${id}`
  }

  const handleGenerarPlan = async () => {
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
      const plan = await generarPlanImplementacion(casoEstudio, interpretacionUsuario, interpretacionIA, apiKey)
      setPlanImplementacion(plan)
      toast({
        title: "Plan generado",
        description: "Se ha generado el plan de implementación con éxito.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al generar plan",
        description: "No se pudo generar el plan de implementación. Verifica tu clave API e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const handleDescargarTexto = () => {
    const contenido = `
# PLAN DE IMPLEMENTACIÓN ISO 14001

## OBJETIVOS
${planImplementacion.objetivos}

## ACCIONES
${planImplementacion.acciones}

## RECURSOS NECESARIOS
${planImplementacion.recursos}

## CRONOGRAMA
${planImplementacion.cronograma}

## INDICADORES DE SEGUIMIENTO
${planImplementacion.indicadores}

## PLAN COMPLETO
${planImplementacion.planCompleto}
    `

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plan-implementacion-iso14001.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Plan descargado",
      description: "El plan de implementación ha sido descargado como archivo de texto.",
    })
  }

  const handleDescargarPDF = async () => {
    try {
      setDescargando(true)

      if (planCompletoRef.current && planImplementacion.planCompleto) {
        await generatePDF(
          planCompletoRef.current,
          "plan-implementacion-iso14001.pdf",
          "Plan de Implementación ISO 14001",
        )
      } else {
        throw new Error("No hay plan de implementación para descargar")
      }
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      toast({
        title: "Error al descargar",
        description: error instanceof Error ? error.message : "No se pudo generar el PDF.",
        variant: "destructive",
      })
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan de Implementación ISO 14001</CardTitle>
          <CardDescription>
            Genera un plan detallado para implementar la norma ISO 14001 basado en el análisis del caso de estudio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
            <h3 className="font-medium mb-2">Resumen del análisis (Referencia)</h3>
            <div className="text-sm">
              <p className="mb-2">
                <strong>Cláusulas relevantes:</strong>{" "}
                {interpretacionUsuario.clausulas.map((clausula) => (
                  <Badge key={clausula} variant="outline" className="mr-1">
                    {getClausulaLabel(clausula)}
                  </Badge>
                ))}
              </p>
              <p className="mb-2">
                <strong>Fortalezas:</strong> {interpretacionUsuario.fortalezas.substring(0, 100)}
                {interpretacionUsuario.fortalezas.length > 100 ? "..." : ""}
              </p>
              <p className="mb-2">
                <strong>Problemas:</strong> {interpretacionUsuario.debilidades.substring(0, 100)}
                {interpretacionUsuario.debilidades.length > 100 ? "..." : ""}
              </p>
            </div>
          </div>

          <Button onClick={handleGenerarPlan} disabled={cargando} className="w-full mb-6">
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando plan de implementación...
              </>
            ) : planImplementacion.planCompleto ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Regenerar plan de implementación
              </>
            ) : (
              "Generar plan de implementación"
            )}
          </Button>

          {planImplementacion.planCompleto && (
            <div ref={planRef}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                  <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
                  <TabsTrigger value="acciones">Acciones</TabsTrigger>
                  <TabsTrigger value="recursos">Recursos</TabsTrigger>
                  <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
                  <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
                  <TabsTrigger value="completo">Plan Completo</TabsTrigger>
                </TabsList>

                <TabsContent value="objetivos">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Objetivos del Plan</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.objetivos.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="acciones">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Acciones a Implementar</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.acciones.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recursos">
                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Recursos Necesarios</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.recursos.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cronograma">
                  <div className="bg-amber-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Cronograma de Implementación</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.cronograma.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="indicadores">
                  <div className="bg-cyan-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Indicadores de Seguimiento</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.indicadores.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="completo">
                  <div className="bg-slate-50 p-4 rounded-md" ref={planCompletoRef}>
                    <h3 className="font-medium mb-2">Plan Completo de Implementación</h3>
                    <div className="prose prose-sm max-w-none">
                      {planImplementacion.planCompleto.split("\n").map((parrafo, index) => (
                        <p key={index} className="mb-2">
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Botones de descarga solo visibles en la pestaña de Plan Completo */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleDescargarTexto} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Descargar texto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDescargarPDF}
                      className="flex items-center gap-2"
                      disabled={descargando}
                    >
                      {descargando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            {planImplementacion.planCompleto && (
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button onClick={onComplete} className="w-full sm:w-auto">
                  Finalizar
                </Button>
                <Button variant="outline" onClick={onReiniciar} className="w-full sm:w-auto">
                  Comenzar nuevo análisis
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

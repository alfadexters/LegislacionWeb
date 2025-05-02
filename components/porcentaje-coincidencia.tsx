"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2 } from "lucide-react"
import { calcularPorcentajeCoincidencia } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"

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
  }
  porcentajeCoincidencia: number
  setPorcentajeCoincidencia: (porcentaje: number) => void
  apiKey: string
}

interface ResultadoCoincidencia {
  porcentaje: number
  explicacion: string
  puntosCoincidentes: string
  puntosDivergentes: string
}

export default function PorcentajeCoincidencia({
  interpretacionUsuario,
  interpretacionIA,
  porcentajeCoincidencia,
  setPorcentajeCoincidencia,
  apiKey,
}: PorcentajeCoincidenciaProps) {
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCoincidencia | null>(null)
  const { toast } = useToast()

  const getNivelCoincidencia = (porcentaje: number) => {
    if (porcentaje >= 80) return { nivel: "Alta", color: "text-green-600" }
    if (porcentaje >= 50) return { nivel: "Media", color: "text-yellow-600" }
    return { nivel: "Baja", color: "text-red-600" }
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
            <p className="text-sm text-gray-500 mb-4">
              Has completado todos los pasos del análisis de la norma ISO 14001. Puedes revisar cualquier sección
              anterior utilizando las pestañas de navegación.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Comenzar nuevo análisis
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

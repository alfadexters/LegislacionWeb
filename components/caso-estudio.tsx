"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2 } from "lucide-react"
import { generarCasoEstudio } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"

interface CasoEstudioProps {
  casoEstudio: string
  setCasoEstudio: (caso: string) => void
  onComplete: () => void
  apiKey: string
}

export default function CasoEstudio({ casoEstudio, setCasoEstudio, onComplete, apiKey }: CasoEstudioProps) {
  const [opcion, setOpcion] = useState<"ia" | "manual">(casoEstudio ? "ia" : "ia")
  const [cargando, setCargando] = useState(false)
  const [casoManual, setCasoManual] = useState({
    empresa: "",
    contexto: "",
    problemas: "",
    acciones: "",
    resultados: "",
  })
  const { toast } = useToast()

  const handleGenerarCaso = async () => {
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
      const caso = await generarCasoEstudio(apiKey)
      setCasoEstudio(caso)
      toast({
        title: "Caso de estudio generado",
        description: "Se ha generado un caso de estudio ficticio con éxito.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al generar caso",
        description: "No se pudo generar el caso de estudio. Verifica tu clave API e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const handleSubmitManual = () => {
    // Validar campos
    if (!casoManual.contexto || !casoManual.problemas || !casoManual.acciones || !casoManual.resultados) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if ((casoManual.contexto + casoManual.problemas + casoManual.acciones + casoManual.resultados).length < 100) {
      toast({
        title: "Contenido insuficiente",
        description: "El caso de estudio debe tener al menos 100 palabras en total.",
        variant: "destructive",
      })
      return
    }

    // Construir el caso de estudio
    const casoCompleto = `
      ${casoManual.empresa ? `Empresa: ${casoManual.empresa}` : "Caso de Estudio ISO 14001"}
      
      Contexto:
      ${casoManual.contexto}
      
      Problemas Ambientales:
      ${casoManual.problemas}
      
      Acciones Implementadas:
      ${casoManual.acciones}
      
      Resultados Obtenidos:
      ${casoManual.resultados}
    `

    setCasoEstudio(casoCompleto)
    toast({
      title: "Caso de estudio guardado",
      description: "Tu caso de estudio ha sido guardado con éxito.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Caso de Estudio - ISO 14001</CardTitle>
          <CardDescription>
            Selecciona cómo quieres obtener el caso de estudio para analizar la implementación de la norma ISO 14001.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={opcion} onValueChange={(v) => setOpcion(v as "ia" | "manual")} className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ia" id="opcion-ia" />
              <Label htmlFor="opcion-ia">Generar caso con IA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="opcion-manual" />
              <Label htmlFor="opcion-manual">Ingresar mi propio caso</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          {opcion === "ia" && (
            <Button onClick={handleGenerarCaso} disabled={cargando} className="w-full">
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando caso de estudio...
                </>
              ) : casoEstudio ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Regenerar caso de estudio
                </>
              ) : (
                "Generar caso de estudio"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {opcion === "manual" && !casoEstudio && (
        <Card>
          <CardHeader>
            <CardTitle>Ingresa tu caso de estudio</CardTitle>
            <CardDescription>
              Completa los siguientes campos para crear tu propio caso de estudio sobre implementación de ISO 14001.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de la empresa (opcional)</Label>
              <Input
                id="empresa"
                value={casoManual.empresa}
                onChange={(e) => setCasoManual({ ...casoManual, empresa: e.target.value })}
                placeholder="Ej: EcoSolutions S.A."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto (sector, tamaño, ubicación) *</Label>
              <Textarea
                id="contexto"
                value={casoManual.contexto}
                onChange={(e) => setCasoManual({ ...casoManual, contexto: e.target.value })}
                placeholder="Describe el sector, tamaño y ubicación de la empresa..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemas">Problemas ambientales *</Label>
              <Textarea
                id="problemas"
                value={casoManual.problemas}
                onChange={(e) => setCasoManual({ ...casoManual, problemas: e.target.value })}
                placeholder="Describe los problemas ambientales identificados..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acciones">Acciones tomadas *</Label>
              <Textarea
                id="acciones"
                value={casoManual.acciones}
                onChange={(e) => setCasoManual({ ...casoManual, acciones: e.target.value })}
                placeholder="Describe las acciones implementadas para cumplir con ISO 14001..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultados">Resultados obtenidos *</Label>
              <Textarea
                id="resultados"
                value={casoManual.resultados}
                onChange={(e) => setCasoManual({ ...casoManual, resultados: e.target.value })}
                placeholder="Describe los resultados obtenidos tras la implementación..."
                rows={3}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitManual} className="w-full">
              Guardar caso de estudio
            </Button>
          </CardFooter>
        </Card>
      )}

      {casoEstudio && (
        <Card>
          <CardHeader>
            <CardTitle>Caso de Estudio</CardTitle>
            <CardDescription>
              {opcion === "ia" ? "Caso generado por Inteligencia Artificial" : "Caso ingresado manualmente"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-green max-w-none">
              {casoEstudio.split("\n").map((parrafo, index) => (
                <p key={index}>{parrafo}</p>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCasoEstudio("")}>
              Borrar caso
            </Button>
            <Button onClick={onComplete}>Continuar a interpretación</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

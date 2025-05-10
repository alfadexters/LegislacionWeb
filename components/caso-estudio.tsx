"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2, Download, FileDown } from "lucide-react"
import { generarCasoEstudio } from "@/lib/gemini-service"
import { useToast } from "@/components/ui/use-toast"
import { generatePDF } from "@/lib/pdf-service"

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
    desafios: "",
    impactos: "",
    expectativas: "",
  })
  const { toast } = useToast()
  const casoEstudioRef = useRef<HTMLDivElement>(null)

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
        description: "Se ha generado un caso de estudio para análisis y solución.",
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
    if (!casoManual.contexto || !casoManual.problemas || !casoManual.desafios || !casoManual.impactos) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if ((casoManual.contexto + casoManual.problemas + casoManual.desafios + casoManual.impactos).length < 200) {
      toast({
        title: "Contenido insuficiente",
        description: "El caso de estudio debe tener al menos 200 palabras en total.",
        variant: "destructive",
      })
      return
    }

    // Construir el caso de estudio
    const casoCompleto = `
      ${casoManual.empresa ? `Empresa: ${casoManual.empresa}` : "Caso de Estudio para Implementación de ISO 14001"}
      
      Contexto de la empresa:
      ${casoManual.contexto}
      
      Problemas ambientales:
      ${casoManual.problemas}
      
      Desafíos organizacionales:
      ${casoManual.desafios}
      
      Impactos negativos actuales:
      ${casoManual.impactos}
      
      Expectativas de las partes interesadas:
      ${casoManual.expectativas || "No especificadas"}
    `

    setCasoEstudio(casoCompleto)
    toast({
      title: "Caso de estudio guardado",
      description: "Tu caso de estudio ha sido guardado con éxito.",
    })
  }

  const handleDescargarCaso = () => {
    const blob = new Blob([casoEstudio], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "caso-estudio-iso14001.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Caso de estudio descargado",
      description: "El caso de estudio ha sido descargado como archivo de texto.",
    })
  }

  const handleDescargarPDF = async () => {
    if (casoEstudioRef.current && casoEstudio) {
      await generatePDF(casoEstudioRef.current, "caso-estudio-iso14001.pdf")
    } else {
      toast({
        title: "Error al descargar",
        description: "No hay caso de estudio para descargar.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Caso de Estudio - Problema de Implementación ISO 14001</CardTitle>
          <CardDescription>
            Selecciona cómo quieres obtener el caso de estudio para analizar y proponer soluciones basadas en la norma
            ISO 14001.
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
              Completa los siguientes campos para crear un caso de estudio sobre problemas de implementación de ISO
              14001.
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
              <Label htmlFor="contexto">Contexto de la empresa (sector, tamaño, ubicación, historia) *</Label>
              <Textarea
                id="contexto"
                value={casoManual.contexto}
                onChange={(e) => setCasoManual({ ...casoManual, contexto: e.target.value })}
                placeholder="Describe el contexto detallado de la empresa..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemas">Problemas ambientales específicos *</Label>
              <Textarea
                id="problemas"
                value={casoManual.problemas}
                onChange={(e) => setCasoManual({ ...casoManual, problemas: e.target.value })}
                placeholder="Describe los problemas ambientales específicos (emisiones, residuos, etc.)..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desafios">Desafíos organizacionales *</Label>
              <Textarea
                id="desafios"
                value={casoManual.desafios}
                onChange={(e) => setCasoManual({ ...casoManual, desafios: e.target.value })}
                placeholder="Describe los desafíos organizacionales (resistencia al cambio, falta de recursos, etc.)..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impactos">Impactos negativos actuales *</Label>
              <Textarea
                id="impactos"
                value={casoManual.impactos}
                onChange={(e) => setCasoManual({ ...casoManual, impactos: e.target.value })}
                placeholder="Describe los impactos negativos actuales (multas, imagen pública, etc.)..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectativas">Expectativas de las partes interesadas (opcional)</Label>
              <Textarea
                id="expectativas"
                value={casoManual.expectativas}
                onChange={(e) => setCasoManual({ ...casoManual, expectativas: e.target.value })}
                placeholder="Describe las expectativas de las partes interesadas (clientes, comunidad, etc.)..."
                rows={3}
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
            <CardTitle>Caso de Estudio para Análisis y Solución</CardTitle>
            <CardDescription>
              {opcion === "ia" ? "Caso generado por Inteligencia Artificial" : "Caso ingresado manualmente"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-green max-w-none" ref={casoEstudioRef}>
              {casoEstudio.split("\n").map((parrafo, index) => (
                <p key={index}>{parrafo}</p>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCasoEstudio("")}>
              Borrar caso
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDescargarCaso}>
                <Download className="mr-2 h-4 w-4" />
                Guardar texto
              </Button>
              <Button variant="outline" onClick={handleDescargarPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={onComplete}>Continuar a análisis</Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

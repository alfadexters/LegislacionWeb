"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

interface InterpretacionUsuarioProps {
  casoEstudio: string
  interpretacion: {
    fortalezas: string
    debilidades: string
    recomendaciones: string
    clausulas: string[]
    interpretacionCompleta: string
  }
  setInterpretacion: (interpretacion: any) => void
  onComplete: () => void
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

export default function InterpretacionUsuario({
  casoEstudio,
  interpretacion,
  setInterpretacion,
  onComplete,
}: InterpretacionUsuarioProps) {
  const [formValues, setFormValues] = useState({
    fortalezas: interpretacion.fortalezas,
    debilidades: interpretacion.debilidades,
    recomendaciones: interpretacion.recomendaciones,
    clausulas: interpretacion.clausulas,
    interpretacionCompleta: interpretacion.interpretacionCompleta,
  })
  const { toast } = useToast()

  const handleClausulaChange = (clausulaId: string) => {
    const updatedClausulas = formValues.clausulas.includes(clausulaId)
      ? formValues.clausulas.filter((id) => id !== clausulaId)
      : [...formValues.clausulas, clausulaId]

    setFormValues({
      ...formValues,
      clausulas: updatedClausulas,
    })
  }

  const handleSubmit = () => {
    // Validar campos
    if (
      !formValues.fortalezas ||
      !formValues.debilidades ||
      !formValues.recomendaciones ||
      !formValues.interpretacionCompleta
    ) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if (formValues.clausulas.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Por favor selecciona al menos una cláusula de ISO 14001 aplicable.",
        variant: "destructive",
      })
      return
    }

    if (formValues.interpretacionCompleta.length < 50) {
      toast({
        title: "Interpretación insuficiente",
        description: "Tu interpretación completa debe tener al menos 50 palabras.",
        variant: "destructive",
      })
      return
    }

    // Guardar interpretación
    setInterpretacion(formValues)
    toast({
      title: "Interpretación guardada",
      description: "Tu interpretación ha sido guardada con éxito.",
    })
    onComplete()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tu Interpretación del Caso</CardTitle>
          <CardDescription>
            Analiza el caso de estudio y proporciona tu interpretación sobre la implementación de ISO 14001.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
            <h3 className="font-medium mb-2">Caso de Estudio (Referencia)</h3>
            <div className="text-sm">
              {casoEstudio.split("\n").map((parrafo, index) => (
                <p key={index} className="mb-2">
                  {parrafo}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fortalezas">¿Qué fortalezas identificas en la implementación de ISO 14001? *</Label>
            <Textarea
              id="fortalezas"
              value={formValues.fortalezas}
              onChange={(e) => setFormValues({ ...formValues, fortalezas: e.target.value })}
              placeholder="Describe las fortalezas que identificas en el caso..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debilidades">¿Qué debilidades o áreas de mejora identificas? *</Label>
            <Textarea
              id="debilidades"
              value={formValues.debilidades}
              onChange={(e) => setFormValues({ ...formValues, debilidades: e.target.value })}
              placeholder="Describe las debilidades o áreas de mejora que identificas..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recomendaciones">¿Qué recomendaciones harías para mejorar la implementación? *</Label>
            <Textarea
              id="recomendaciones"
              value={formValues.recomendaciones}
              onChange={(e) => setFormValues({ ...formValues, recomendaciones: e.target.value })}
              placeholder="Describe tus recomendaciones para mejorar la implementación..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="mb-2 block">¿Qué cláusulas de ISO 14001 se aplicaron en el caso? *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {clausulasISO14001.map((clausula) => (
                <div key={clausula.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`clausula-${clausula.id}`}
                    checked={formValues.clausulas.includes(clausula.id)}
                    onCheckedChange={() => handleClausulaChange(clausula.id)}
                  />
                  <Label htmlFor={`clausula-${clausula.id}`}>{clausula.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interpretacionCompleta">Tu interpretación completa del caso *</Label>
            <Textarea
              id="interpretacionCompleta"
              value={formValues.interpretacionCompleta}
              onChange={(e) => setFormValues({ ...formValues, interpretacionCompleta: e.target.value })}
              placeholder="Proporciona tu interpretación completa del caso (máximo 500 palabras)..."
              rows={6}
              required
            />
            <p className="text-sm text-gray-500">{formValues.interpretacionCompleta.length}/500 caracteres</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Guardar interpretación y continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

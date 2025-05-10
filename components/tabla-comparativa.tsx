"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface TablaComparativaProps {
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

export default function TablaComparativa({
  interpretacionUsuario,
  interpretacionIA,
  onComplete,
}: TablaComparativaProps) {
  // Obtener el nombre completo de la cláusula a partir de su ID
  const getClausulaLabel = (id: string) => {
    const clausula = clausulasISO14001.find((c) => c.id === id)
    return clausula ? clausula.label : `Cláusula ${id}`
  }

  const criterios = [
    {
      id: "fortalezas",
      nombre: "Fortalezas identificadas",
      pregunta:
        "¿Qué aspectos positivos o fortalezas identificas en la empresa que podrían facilitar la implementación de ISO 14001?",
      usuario: interpretacionUsuario.fortalezas,
      ia: interpretacionIA.fortalezas,
    },
    {
      id: "debilidades",
      nombre: "Problemas identificados",
      pregunta:
        "¿Cuáles son los principales problemas ambientales y organizacionales que dificultan la implementación de ISO 14001?",
      usuario: interpretacionUsuario.debilidades,
      ia: interpretacionIA.debilidades,
    },
    {
      id: "recomendaciones",
      nombre: "Requisitos prioritarios",
      pregunta: "¿Qué requisitos de la norma ISO 14001 serían prioritarios para abordar los problemas identificados?",
      usuario: interpretacionUsuario.recomendaciones,
      ia: interpretacionIA.recomendaciones,
    },
    {
      id: "acciones",
      nombre: "Acciones recomendadas",
      pregunta: "¿Qué acciones recomendarías para implementar la norma ISO 14001 y resolver esta situación?",
      usuario: interpretacionUsuario.interpretacionCompleta,
      ia: interpretacionIA.analisisCompleto,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tabla Comparativa</CardTitle>
          <CardDescription>
            Comparación entre tus respuestas y las respuestas de la IA sobre el caso de estudio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Pregunta</TableHead>
                  <TableHead>Tu Respuesta</TableHead>
                  <TableHead>Respuesta de la IA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criterios.map((criterio) => (
                  <TableRow key={criterio.id}>
                    <TableCell className="font-medium">{criterio.pregunta}</TableCell>
                    <TableCell>{criterio.usuario}</TableCell>
                    <TableCell>{criterio.ia}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Cláusulas ISO 14001 consideradas relevantes</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {interpretacionUsuario.clausulas.map((clausula) => (
                        <Badge key={clausula} variant="outline" className="mb-1">
                          {getClausulaLabel(clausula)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {interpretacionIA.clausulasRelevantes && interpretacionIA.clausulasRelevantes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {interpretacionIA.clausulasRelevantes.map((clausula) => (
                          <Badge key={clausula} variant="outline" className="mb-1">
                            {getClausulaLabel(clausula)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <em>No especificado</em>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onComplete}>Continuar a porcentaje de coincidencia</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  }
  onComplete: () => void
}

export default function TablaComparativa({
  interpretacionUsuario,
  interpretacionIA,
  onComplete,
}: TablaComparativaProps) {
  const criterios = [
    {
      id: "fortalezas",
      nombre: "Fortalezas identificadas",
      usuario: interpretacionUsuario.fortalezas,
      ia: interpretacionIA.fortalezas,
    },
    {
      id: "debilidades",
      nombre: "Debilidades identificadas",
      usuario: interpretacionUsuario.debilidades,
      ia: interpretacionIA.debilidades,
    },
    {
      id: "recomendaciones",
      nombre: "Recomendaciones propuestas",
      usuario: interpretacionUsuario.recomendaciones,
      ia: interpretacionIA.recomendaciones,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tabla Comparativa</CardTitle>
          <CardDescription>
            Comparación entre tu interpretación y la interpretación de la IA sobre el caso de estudio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Criterio</TableHead>
                  <TableHead>Tu Interpretación</TableHead>
                  <TableHead>Interpretación de la IA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criterios.map((criterio) => (
                  <TableRow key={criterio.id}>
                    <TableCell className="font-medium">{criterio.nombre}</TableCell>
                    <TableCell>{criterio.usuario}</TableCell>
                    <TableCell>{criterio.ia}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Cláusulas ISO 14001 aplicadas</TableCell>
                  <TableCell>
                    {interpretacionUsuario.clausulas.map((clausula) => (
                      <div key={clausula} className="mb-1">
                        • Cláusula {clausula}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <em>No especificado explícitamente por la IA</em>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onComplete} className="w-full">
            Continuar a porcentaje de coincidencia
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

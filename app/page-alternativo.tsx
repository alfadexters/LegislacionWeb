"use client"

import { useState, useEffect } from "react"
import CasoEstudio from "@/components/caso-estudio"
import InterpretacionUsuario from "@/components/interpretacion-usuario"
import InterpretacionIA from "@/components/interpretacion-ia"
import TablaComparativa from "@/components/tabla-comparativa"
import PorcentajeCoincidencia from "@/components/porcentaje-coincidencia"
import ApiKeyModal from "@/components/api-key-modal"
import DialogoConfirmacionAlternativo from "@/components/dialogo-confirmacion-alternativo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/lib/use-local-storage"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("caso-estudio")
  const [progress, setProgress] = useState(0)
  const [casoEstudio, setCasoEstudio] = useLocalStorage("caso-estudio", "")
  const [interpretacionUsuario, setInterpretacionUsuario] = useLocalStorage("interpretacion-usuario", {
    fortalezas: "",
    debilidades: "",
    recomendaciones: "",
    clausulas: [],
    interpretacionCompleta: "",
  })
  const [interpretacionIA, setInterpretacionIA] = useLocalStorage("interpretacion-ia", {
    fortalezas: "",
    debilidades: "",
    recomendaciones: "",
    analisisCompleto: "",
  })
  const [porcentajeCoincidencia, setPorcentajeCoincidencia] = useLocalStorage("porcentaje-coincidencia", 0)
  const [apiKey, setApiKey] = useState("")
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const { toast } = useToast()

  // Estado para controlar la visibilidad del diálogo de confirmación alternativo
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Cargar la clave API del localStorage al iniciar
  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini-api-key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    } else {
      setShowApiKeyModal(true)
    }
  }, [])

  // Actualizar el progreso basado en los datos completados
  useEffect(() => {
    let completedSteps = 0
    if (casoEstudio) completedSteps++
    if (interpretacionUsuario.interpretacionCompleta) completedSteps++
    if (interpretacionIA.analisisCompleto) completedSteps++
    if (porcentajeCoincidencia > 0) completedSteps++

    setProgress((completedSteps / 4) * 100)
  }, [casoEstudio, interpretacionUsuario, interpretacionIA, porcentajeCoincidencia])

  const handleTabChange = (value: string) => {
    // Validar si se puede cambiar de pestaña
    if (value === "interpretacion-usuario" && !casoEstudio) {
      toast({
        title: "Caso de estudio requerido",
        description: "Primero debes generar o ingresar un caso de estudio.",
        variant: "destructive",
      })
      return
    }

    if (value === "interpretacion-ia" && !interpretacionUsuario.interpretacionCompleta) {
      toast({
        title: "Interpretación requerida",
        description: "Primero debes completar tu interpretación del caso.",
        variant: "destructive",
      })
      return
    }

    if (value === "tabla-comparativa" && !interpretacionIA.analisisCompleto) {
      toast({
        title: "Análisis de IA requerido",
        description: "Primero debes obtener la interpretación de la IA.",
        variant: "destructive",
      })
      return
    }

    setActiveTab(value)
  }

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key)
    localStorage.setItem("gemini-api-key", key)
    setShowApiKeyModal(false)
  }

  // Función para mostrar el diálogo de confirmación
  const mostrarConfirmacion = () => {
    setConfirmDialogOpen(true)
  }

  // Función para reiniciar el análisis
  const reiniciarAnalisis = () => {
    // Borrar todos los datos excepto la clave API
    setCasoEstudio("")
    setInterpretacionUsuario({
      fortalezas: "",
      debilidades: "",
      recomendaciones: "",
      clausulas: [],
      interpretacionCompleta: "",
    })
    setInterpretacionIA({
      fortalezas: "",
      debilidades: "",
      recomendaciones: "",
      analisisCompleto: "",
    })
    setPorcentajeCoincidencia(0)
    setActiveTab("caso-estudio")
    toast({
      title: "Análisis reiniciado",
      description: "Se ha iniciado un nuevo análisis. Todos los campos han sido borrados.",
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Sistema de Gestión Ambiental</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-center text-green-700 mb-8">Norma ISO 14001</h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowApiKeyModal(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="caso-estudio">1. Caso de Estudio</TabsTrigger>
          <TabsTrigger value="interpretacion-usuario">2. Tu Interpretación</TabsTrigger>
          <TabsTrigger value="interpretacion-ia">3. Análisis IA</TabsTrigger>
          <TabsTrigger value="tabla-comparativa">4. Comparativa</TabsTrigger>
          <TabsTrigger value="porcentaje-coincidencia">5. Coincidencia</TabsTrigger>
        </TabsList>

        <TabsContent value="caso-estudio">
          <CasoEstudio
            casoEstudio={casoEstudio}
            setCasoEstudio={setCasoEstudio}
            onComplete={() => setActiveTab("interpretacion-usuario")}
            apiKey={apiKey}
          />
        </TabsContent>

        <TabsContent value="interpretacion-usuario">
          <InterpretacionUsuario
            casoEstudio={casoEstudio}
            interpretacion={interpretacionUsuario}
            setInterpretacion={setInterpretacionUsuario}
            onComplete={() => setActiveTab("interpretacion-ia")}
          />
        </TabsContent>

        <TabsContent value="interpretacion-ia">
          <InterpretacionIA
            casoEstudio={casoEstudio}
            interpretacionUsuario={interpretacionUsuario}
            interpretacionIA={interpretacionIA}
            setInterpretacionIA={setInterpretacionIA}
            onComplete={() => setActiveTab("tabla-comparativa")}
            apiKey={apiKey}
          />
        </TabsContent>

        <TabsContent value="tabla-comparativa">
          <TablaComparativa
            interpretacionUsuario={interpretacionUsuario}
            interpretacionIA={interpretacionIA}
            onComplete={() => setActiveTab("porcentaje-coincidencia")}
          />
        </TabsContent>

        <TabsContent value="porcentaje-coincidencia">
          <PorcentajeCoincidencia
            interpretacionUsuario={interpretacionUsuario}
            interpretacionIA={interpretacionIA}
            porcentajeCoincidencia={porcentajeCoincidencia}
            setPorcentajeCoincidencia={setPorcentajeCoincidencia}
            apiKey={apiKey}
            onReiniciar={mostrarConfirmacion}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación alternativo */}
      <DialogoConfirmacionAlternativo
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={reiniciarAnalisis}
        title="Comenzar nuevo análisis"
        message="¿Estás seguro de que deseas comenzar un nuevo análisis? Se borrarán todos los datos ingresados hasta ahora."
        cancelText="Cancelar"
        confirmText="Sí, comenzar nuevo análisis"
      />

      {showApiKeyModal && <ApiKeyModal onApiKeySubmit={handleApiKeySubmit} />}

      <Toaster />
    </main>
  )
}

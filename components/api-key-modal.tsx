"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void
}

export default function ApiKeyModal({ onApiKeySubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [open, setOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar si ya existe una clave API en localStorage
    const storedApiKey = localStorage.getItem("gemini-api-key")
    if (!storedApiKey) {
      setOpen(true)
    } else {
      setApiKey(storedApiKey)
      onApiKeySubmit(storedApiKey)
    }
  }, [onApiKeySubmit])

  const validateApiKey = async (key: string) => {
    setIsValidating(true)
    setIsValid(null)

    try {
      const response = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValid(true)
        localStorage.setItem("gemini-api-key", key)
        onApiKeySubmit(key)
        setOpen(false)
        toast({
          title: "Clave API válida",
          description: "La clave API de Google Gemini ha sido validada y guardada.",
        })
      } else {
        setIsValid(false)
        toast({
          title: "Clave API inválida",
          description: data.message || "La clave API proporcionada no es válida.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al validar la clave API:", error)
      setIsValid(false)
      toast({
        title: "Error de validación",
        description: "No se pudo validar la clave API. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      validateApiKey(apiKey.trim())
    } else {
      toast({
        title: "Clave API requerida",
        description: "Por favor ingresa una clave API válida.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar clave API de Google Gemini</DialogTitle>
          <DialogDescription>
            Para utilizar esta aplicación, necesitas proporcionar tu propia clave API de Google Gemini. Puedes obtener
            una clave API gratuita en{" "}
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">Clave API de Google Gemini</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Ingresa tu clave API"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
              </div>
              {isValid === false && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Clave API inválida</span>
                </div>
              )}
              {isValid === true && (
                <div className="flex items-center gap-2 text-green-500 text-sm mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Clave API válida</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isValidating}>
              {isValidating ? "Validando..." : "Guardar clave API"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

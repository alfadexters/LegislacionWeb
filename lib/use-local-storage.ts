"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Inicializar el estado con el valor de localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.log(error)
    }
  }, [key])

  // Función para actualizar el valor en localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que el valor sea una función para que podamos tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Guardar el estado
      setStoredValue(valueToStore)

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

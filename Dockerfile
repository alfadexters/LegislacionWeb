# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de definición del proyecto
COPY package.json package-lock.json ./

# Copiar archivos de configuración necesarios
COPY tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts ./

# Copiar carpetas de código y recursos
COPY public ./public
COPY styles ./styles
COPY app ./app
COPY components ./components
COPY config ./config
COPY hooks ./hooks
COPY lib ./lib

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Compilar la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos compilados y necesarios desde el builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Exponer el puerto que usa Next.js en producción
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npx", "next", "start"]

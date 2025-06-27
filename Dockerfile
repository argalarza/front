# Etapa de construcción
FROM node:18 AS build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias (evita conflictos de peer dependencies)
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente al contenedor
COPY . .

# Construir la aplicación en modo producción
RUN npm run build

# Etapa para servir la aplicación con Nginx
FROM nginx:alpine

# Copiar los archivos construidos al directorio raíz de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]

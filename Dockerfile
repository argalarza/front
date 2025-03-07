# Etapa de construcción
FROM node:18 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa para servir la aplicación
FROM nginx:alpine

# Copiar el contenido de la carpeta build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto que usará la app
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

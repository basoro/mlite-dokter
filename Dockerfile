# Stage 1: Build the React application 
FROM node:20-alpine as build 
WORKDIR /app 
COPY package*.json ./ 
# Force development mode for npm install so devDependencies (like Vite) are installed
ENV NODE_ENV=development
RUN npm install 
# Baris ini akan meng-copy semua file, TERMASUK file .env yang digenerate oleh Papuyu
COPY . . 
# Reset to production for the actual build
ENV NODE_ENV=production
# Vite akan otomatis membaca file .env tersebut
RUN npm run build 

# Stage 2: Serve the application using Nginx 
FROM nginx:alpine 
COPY --from=build /app/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
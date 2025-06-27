# Étape 1 : build (optionnel si tu as un projet TypeScript ou bundlé)
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Étape 2 : image finale
FROM node:18

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "start"]

FROM node:18-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install --production=false
COPY src ./src
RUN npm run build
EXPOSE 3011
CMD ["node", "dist/index.js"]

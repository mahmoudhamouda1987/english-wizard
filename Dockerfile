FROM node:22-bookworm-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev=false

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "run", "start"]

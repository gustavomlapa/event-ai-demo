# Estágio 1: Instalação das dependências de produção
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Estágio 2: Imagem final enxuta para execução no Cloud Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copia dependências instaladas do builder
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY public/ ./public/

# Ajusta permissões para usuário seguro não-root
RUN chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "src/server.js"]

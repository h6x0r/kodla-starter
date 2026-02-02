# syntax=docker/dockerfile:1

FROM node:20-bullseye AS builder
WORKDIR /app

# Ensure devDependencies are installed (needed for @nestjs/cli build)
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

CMD ["node", "dist/main"]

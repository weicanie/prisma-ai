# syntax=docker/dockerfile:1

# --- Stage 1: Build frontend assets ---
ARG NODE_VERSION=20.11.0
ARG PNPM_VERSION=9.15.4

FROM docker.1ms.run/library/node:${NODE_VERSION} AS builder


RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml* ./
COPY ./packages/frontend/package.json ./packages/frontend/
COPY ./packages/shared/package.json ./packages/shared/

RUN pnpm install --filter frontend --filter @prisma-ai/shared --frozen-lockfile

COPY ./packages/shared ./packages/shared
COPY ./packages/frontend ./packages/frontend

RUN pnpm --filter @prisma-ai/shared build

RUN pnpm --filter frontend build

FROM docker.1ms.run/library/nginx:alpine

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

COPY ./nginx/conf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
# syntax=docker/dockerfile:1

# ---- Build ----
FROM node:22-slim AS build
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Variables públicas de Astro: se inyectan en el bundle en tiempo de build.
# Pásalas con --build-arg; sin ellas, el cliente fallará al arrancar.
ARG PUBLIC_COGNITO_USER_POOL_ID
ARG PUBLIC_COGNITO_CLIENT_ID
ARG PUBLIC_API_URL=http://localhost:8000
ENV PUBLIC_COGNITO_USER_POOL_ID=$PUBLIC_COGNITO_USER_POOL_ID \
    PUBLIC_COGNITO_CLIENT_ID=$PUBLIC_COGNITO_CLIENT_ID \
    PUBLIC_API_URL=$PUBLIC_API_URL

RUN pnpm build

# ---- Runtime ----
FROM node:22-slim AS runtime
WORKDIR /app

ENV HOST=0.0.0.0 \
    PORT=4321

# El adapter standalone de Astro es autocontenido: solo hace falta dist/.
COPY --from=build /app/dist ./dist

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]

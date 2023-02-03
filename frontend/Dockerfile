# Stage 1

# Install dependencies only when needed.
FROM node:16.19.0-alpine AS deps
WORKDIR /app
COPY patches ./patches
COPY package.json package-lock.json ./
RUN npm ci


# Stage 2

# Rebuild the source code only when needed.
FROM node:16.19.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build-only


# Stage 3

# Production image, copy all the files and run nginx.
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

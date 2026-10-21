# Stage 1: build the React app
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: run the API and serve the built app
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=client /app/client/dist ./client/dist
ENV PORT=4000 DATA_FILE=/data/tasks.json
EXPOSE 4000
CMD ["node", "server/src/index.js"]

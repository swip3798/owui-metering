FROM node:22 AS builder

WORKDIR /src
COPY . .
RUN npm install
RUN npm run build

FROM node:22-alpine
ENV DB_FILE_NAME=file:/app/data/data.db
ENV HOST=0.0.0.0
ENV PORT=45000
RUN npm install pm2@latest -g
RUN apk add typst
WORKDIR /app
RUN mkdir /app/data
COPY --from=builder /src/build ./build
COPY --from=builder /src/package.json .
COPY --from=builder /src/package-lock.json .
COPY --from=builder /src/drizzle.config.ts .
COPY --from=builder /src/src ./src
RUN npm ci --omit dev
RUN npm install express
RUN npm i -D drizzle-kit
COPY ./scripts ./scripts
COPY ./scripts/express-server.js .

CMD ["sh", "./scripts/start.sh"]

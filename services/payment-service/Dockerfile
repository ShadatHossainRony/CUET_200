# Simple Dockerfile for payment service
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package manifest first (leverages Docker layer caching)
COPY package.json ./

# Install production dependencies
RUN npm install  && npm cache clean --force

# Copy source
COPY src ./src
COPY index.js ./

# Copy env (optionally you may mount at runtime instead)
COPY .env ./

EXPOSE 8004

CMD ["node", "index.js"]

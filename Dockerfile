# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy lockfile and package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the app to create the dist folder
RUN pnpm run build

# Prepare a directory with only the files listed in package.json "files"
RUN mkdir /app/prod && \
    cp package.json /app/prod/ && \
    cp -r node_modules /app/prod/ && \
    node -e "const {files} = require('./package.json'); \
      files.forEach(f => require('fs').cpSync(f, '/app/prod/' + f, {recursive: true}));"

# Production stage
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

# Copy only the production files
COPY --from=builder /app/prod/ ./

CMD ["bin/cli.js"]

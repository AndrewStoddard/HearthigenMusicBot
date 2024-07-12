# Stage 1: Build TypeScript
FROM node:20 as build

WORKDIR /opt/lavamusic/

# Copy package files and install dependencies
COPY package*.json ./

RUN apt-get update && \
    apt-get install -y && \
    npm install --no-audit --verbose

# Copy source code
COPY . .

# Copy tsconfig.json
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Stage 2: Create production image
FROM node:20-slim AS production

WORKDIR /opt/lavamusic/

# Copy compiled code
COPY --from=build /opt/lavamusic/dist ./dist
COPY --from=build /opt/lavamusic/src/utils/LavaLogo.txt ./src/utils/LavaLogo.txt
COPY --from=build /opt/lavamusic/database/lavamusic.db ./database/lavamusic.db

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

CMD [ "node", "dist/index.js" ]

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

# Debug: List contents before build
RUN ls -la

RUN npm run build

# Debug: List contents after build
RUN ls -la
RUN ls -la dist/ || echo "dist directory not created"

EXPOSE 8080

CMD ["node", "dist/app.js"]

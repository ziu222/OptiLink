# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Cài đặt bash để chạy script nếu cần
RUN apk add --no-cache bash

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn
COPY . .

# Build TypeScript code ra JavaScript
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Chỉ copy những thứ cần thiết để chạy
COPY package*.json ./
RUN npm ci --omit=dev

# Copy thư mục dist (kết quả của quá trình build) từ stage builder
COPY --from=builder /usr/src/app/dist ./dist

# Biến môi trường mặc định (có thể bị ghi đè bởi docker-compose)
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]

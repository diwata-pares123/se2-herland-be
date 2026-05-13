FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This is critical so the container knows your database structure
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
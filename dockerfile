FROM node:18.17.1
WORKDIR /app
COPY . /app
RUN npm rebuild bcrypt --build-from-source
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential
RUN npm install
EXPOSE 3001
CMD ["node", "src/index.js"]
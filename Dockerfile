FROM node:18-alpine3.15

COPY . ./video-streaming-app

WORKDIR /video-streaming-app/server

RUN  npm install

EXPOSE 3000

CMD [ "node", "./server.js"]


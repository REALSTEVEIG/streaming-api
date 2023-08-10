FROM node:16.20.1-alpine3.18

WORKDIR /app

COPY package.json .

RUN node -v

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; then \
    npm install; \
    else \
    npm install --only=production; \
    fi

COPY . ./

EXPOSE 4000

CMD ["node", "app.js"]
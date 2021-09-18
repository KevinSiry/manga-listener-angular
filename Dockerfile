# Stage 1: Build
FROM node:10-alpine as builder
RUN apk add g++ make python

COPY package.json package-lock.json ./
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .
RUN node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --output-path=dist --progress

# Stage 2
FROM nginx:1.14.1-alpine

COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
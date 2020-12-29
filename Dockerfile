FROM node:alpine3.12

RUN apk add --no-cache bash

# RUN apk update
RUN apk add --update netcat-openbsd
# RUN apk --update --no-cache add tzdata bash curl \
#     && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
#     && echo "Asia/Shanghai" > /etc/timezone \
#     && apk del tzdata

WORKDIR /usr/src

COPY package*.json ./

RUN npm install -g nodemon

RUN npm install

# COPY ./ ./

# CMD ["npm","run","dev"]
FROM ubuntu:xenial

WORKDIR /usr/local/app

COPY . /usr/local/app

RUN apt-get update && \
apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get update && \
apt-get install -y nodejs git python make

RUN rm -rf node_modules
RUN npm install

RUN apt-get update && \
apt-get install graphicsmagick -y


EXPOSE 3000

CMD ["npm", "start"]

# saveimages
Storing high quality medical images into a structured File System

this frontend runs against a pseudo distributed node of HDFS

**Attention: every command mentioned in this readme should be run in the project folder**

## prerequisites
### install backend
- install docker
- run `docker-compose up -d` in project folder to spin up the hadoop image and the backend image


**In case you get an error that one or multiple ports are in use, you'll need to change the port mapping in the following way:**
- run `docker-compose stop`
- open `docker-compose.yml`
You'll see a long list of port mappings. The first number is the port on your system, the second is the port inside of the docker container. 
- change the affected port (keep in mind to only change the first of the two numbers, as a change of the second number will break the application)

## run the frontend

### development mode
- install nodejs Version 7
- run npm install in project folder
- run npm start
### build frontend for your system
- `node_modules/.bin/electron-packager . saveimages`
- run the executable in the created folder
### download prebuild package
Download the package for your operating system here: [Google Drive](https://goo.gl/EvJBPg)

## additional notes
### delete files in hadoop
- log in docker container `docker exec -it [name] bash`
- execute delete with user `hduser`:
`HADOOP_USER_NAME=hduser hdfs dfs -rm -r "/tmp/*"`

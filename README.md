# saveimages
Storing high quality medical images into a structured File System

this frontend runs against a pseudo distributed node of HDFS

## installation
- install docker
- run `docker-compose up -d` to spin up the hadoop image and the backend image

## run the frontend

### development mode
-- install nodejs Version 7
-- run npm install in project folder
-- run npm start
### build frontend for your system
`node_modules/.bin/electron-packager . saveimages`
run the executable in the created folder
### download prebuild package
Download the package for your operating system here: [Google Drive](https://goo.gl/EvJBPg)

## additional notes
### delete files in hadoop
- log in docker container `docker exec -it [name] bash`
- execute delete with user `hduser`: <br>
`HADOOP_USER_NAME=hduser hdfs dfs -rm -r "/tmp/*"`
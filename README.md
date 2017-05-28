# saveimages
Storing high quality medical images into a structured File System

this frontend runs against a pseudo distributed node of HDFS

install docker,
install docker image https://hub.docker.com/r/chalimartines/cdh5-pseudo-distributed/

install nodejs,
run npm install in folder which contains package.json,
run npm start

## delete files in hadoop
- log in docker container `docker exec -it [name] bash`
- execute delete with user `hduser`: <br>
`HADOOP_USER_NAME=hduser hdfs dfs -rm -r "/tmp/*"`
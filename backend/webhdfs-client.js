// Include webhdfs module
var WebHDFS = require('webhdfs');

// Create a new
var hdfs = WebHDFS.createClient({
  user: 'hduser', // Hadoop user
  host: 'localhost', // Namenode host
  port: 50070,// Namenode port
  path: "webhdfs/v1", 
  overwrite: false
});

module.exports = hdfs;
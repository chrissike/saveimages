// Include webhdfs module
var WebHDFS = require('webhdfs');

console.log(process.env.NODE_ENV);

// Create a new
var hdfs = WebHDFS.createClient({
  user: 'hduser', // Hadoop user
  host: process.env.NODE_ENV === 'production' ? 'hadoop' : 'localhost', // Namenode host
  port: 50070, // Namenode port
  path: 'webhdfs/v1',
  overwrite: false
});

module.exports = hdfs;

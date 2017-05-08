const app = require('electron').remote;
const fs = require('fs');
const path = require('path');
const hdfs = require('./webhdfs-client');
const jic = require('./JIC.js');

const dialog = app.dialog;

const openBtn = document.getElementById('openFile');
const txtArea = document.getElementById('txtArea');


openBtn.addEventListener('click', () => {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) {
            console.log("No file selected");
            return;
        }

        readFile(fileNames[0]);
    });
});


/* function readFile(filepath){
    fs.readFile(filepath, 'utf-8', function (err,data){
        if(err){
            alert("An error occured reading the file: " + err.message);
            return;
        }

        let ext = path.extname(filepath);
        console.log(ext);
        console.log(filepath);
        if(ext == '.txt'){
            txtArea.innerText = data;
        }
        if (ext == '.png'||'.jpg'){
            txtArea.innerText = filepath;
            myImg.src = filepath;
        }
        
    });
    }
    */

function readFile(filepath) {
    let ext = path.extname(filepath);
    console.log(ext);
    console.log(filepath);
    if (ext == '.png' || ext == '.jpg' || ext == ".dng" || ext == ".txt") {



        var localFileStream = fs.createReadStream(filepath);

        localFileStream.on('open', function () {

            const writable = fs.createWriteStream('./file.txt');
            localFileStream.pipe(writable);

            //========= Step 1 - Client Side Compression ===========

            //Images Objects

            //(NOTE: see the examples/js/demo.js file to understand how this object could be a local image 
            //from your filesystem using the File API)

            var myImage = new Image();
            myImage.src = filepath;

            //An Integer from 0 to 100
            var quality = 80;
            // output file format (jpg || png)
            var output_format = 'jpg';
            //This function returns an Image Object 
            //var compressedImg = jic.compress(myImage, quality, output_format).src;


            var remoteFileStream = hdfs.createWriteStream('/tmp/' + path.basename(filepath));

            // Pipe data to HDFS
            localFileStream.pipe(remoteFileStream);

            // Handle errors
            remoteFileStream.on('error', function onError(err) {
                alert("An error occured reading the file: " + err.message);

                // Do something with the error

            });

            // Handle finish event
            remoteFileStream.on('finish', function onFinish() {
                // Upload is done
                alert("Upload succeeded");
            });

        });






    }

}


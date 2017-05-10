const app = require('electron').remote;
const fs = require('fs');
const path = require('path');
const hdfs = require('./webhdfs-client');
const webp = require('webp-converter');
const os = require('os');

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


        const outputfile = path.basename(filepath,ext) + '.webp';
        const tmpdir = os.tmpdir();

        webp.cwebp(filepath, tmpdir + '/' + outputfile, "-q 80", function (status) {
            //if exicuted successfully status will be '100' 
            //if exicuted unsuccessfully status will be '101' 


            console.log(status);


            var localFileStream = fs.createReadStream(tmpdir + '/' + outputfile);

            localFileStream.on('open', function () {

                //const writable = fs.createWriteStream('./file.txt');
                //localFileStream.pipe(writable);
                //pass input image(.jpeg,.pnp .....) path ,output image(give path where to save and image file name with .webp extension) 
                //pass option(read  documentation for options) 

                //cwebp(input,output,option,result_callback) 




                var remoteFileStream = hdfs.createWriteStream('/tmp/' + outputfile);

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

        });




    }

}


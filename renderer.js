const app = require('electron').remote;
const fs = require('fs');
const path = require('path');
const hdfs = require('./webhdfs-client');
const webp = require('webp-converter');
const os = require('os');
var mapslice = require("mapslice");
const tilenol = require('tilenol');
const sharp = require('sharp');

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

        const tmpdir = os.tmpdir();

        const zoom = 20;

        var image = sharp(filepath);
        var itterations = zoom



        image
            .metadata()
            .then(function (metadata) {
                console.log('metadata', metadata);

                var tileSize = 512;

                var widthTiles = Math.ceil((metadata.width - 1) / tileSize);
                var heightTiles = Math.ceil((metadata.height - 1) / tileSize);
                var tileCounter = widthTiles * heightTiles
                console.log('widthTiles = ', widthTiles);
                console.log('heightTiles = ', heightTiles);


                for (var l = 0; l < widthTiles; l++) {
                    console.log('ÖLSDKFJ', 'left', l);

                    const left = l * tileSize
                    const width = (l == widthTiles - 1) ? metadata.width - left : tileSize
                    console.log(metadata.with, left);

                    for (var t = 0; t < heightTiles; t++) {
                        console.log('ÖLSDKFJ', 'top', t);

                        const top = t * tileSize
                        const height = (t == heightTiles - 1) ? metadata.height - top : tileSize

                        const extractOptions = { left: left, top: top, width: width, height: height };
                        console.log(extractOptions)
                        image.extract(extractOptions)
                            .toFile('./' + left + 'x' + top + '.jpg', function (err) {
                                // output.jpg is a 300 pixels wide and 200 pixels high image
                                // containing a scaled and cropped version of input.jpg
                                if (err) console.error(err);


                                const outputfile = path.basename('./' + left + 'x' + top + '.jpg', ext) + '.webp';




                                webp.cwebp('./' + left + 'x' + top + '.jpg', tmpdir + '/' + outputfile, "-q 80", function (status) {
                                    //if exicuted successfully status will be '100' 
                                    //if exicuted unsuccessfully status will be '101' 


                                    var localFileStream = fs.createReadStream(tmpdir + '/' + outputfile);

                                    localFileStream.on('open', function () {



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

                                    console.log(status);



                                });

                            });

                    } console.log('done');
                }





            });

    }















}


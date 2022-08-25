var AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});
const s3 = new AWS.S3();
const db = require('./database.js');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const path = require("path");
const app = express();
const port = 3000;
const clientApp = path.join(__dirname, "../frontend"); // path to folder with the HTML file

db.initDB();

// db.clearTable();

app.use(express.json({limit: "100mb"})); // to parse application/json
app.use(express.urlencoded({ limit: "100mb",extended: true })); // to parse application/x-www-form-urlencoded
app.use('/',express.static(clientApp,{ extensions: ["html"] }));

app.route('/test').get((req,res) => {
    db.getAllVideos().then(()=>{
        console.log("Done");
    })
});

app.route('/upload').post((req,res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err,fields,file) => {
        var name = fields.videoName;
        var description = fields.videoDescription;
        var id = uuidv4();
        var filepath = file.video.filepath;
        var newpath = './uploads/' + id + '.' + file.video.originalFilename.split('.')[1];
        fs.renameSync(filepath,newpath);
        // TODO: ADD S3 CODE HERE
        var obj = {
            id: id,
            name: name,
            description: description
        };
        db.addVideo(obj).then(()=>{
            res.send(obj);
        })
    })
});

app.route('/getVideos').get((req,res) => {
    db.getAllVideos().then((responseText)=>{
        res.send(responseText);
    });
});

app.listen(port,()=>{console.log(`Serving on port ${port}`)});

/*s3.listObjects({
    Bucket: "video-bucket-videostream",
    Prefix: "xyz/"
}, (err,data)=>{
    if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
    }
})*/

/*app.route('/test').get((req,res) => {
    db.addVideo({
        id: uuidv4(),
        name: 'Hello',
        description: 'test'
    }).then(()=>{
        console.log("Done");
    })
})*/
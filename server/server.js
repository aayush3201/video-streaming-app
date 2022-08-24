var AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});
const s3 = new AWS.S3();
const db = require('./database.js');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const path = require("path");
const app = express();
const port = 3000;
const clientApp = path.join(__dirname, "../frontend"); // path to folder with the HTML file

db.initDB();

// db.clearTable();

app.use(express.json()); // to parse application/json
app.use(express.urlencoded({ extended: true })); // to parse application/x-www-form-urlencoded
app.use('/',express.static(clientApp,{ extensions: ["html"] }));

app.route('/test').get((req,res) => {
    db.getAllVideos().then(()=>{
        console.log("Done");
    })
});

app.route('/upload').post((req,res) => {
    var name = req.body.name;
    var description = req.body.description;
    var id = uuidv4();
    var obj = {
        name: name,
        description: description,
        id: id
    }
    db.addVideo(obj).then(() => {
        res.send(obj);
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
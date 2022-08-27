var AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});
const s3 = new AWS.S3();
const db = require('./database.js');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const formidable = require('formidable');
const { getVideoDurationInSeconds } = require('get-video-duration');
// extractFrames setup begin
const extractFrames = require('ffmpeg-extract-frames')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// extractFrames setup end
const fs = require('fs');
const path = require("path");
const app = express();
const port = 3000;
const clientApp = path.join(__dirname, "../frontend"); // path to folder with the HTML file
const videoPage = path.join(__dirname,"../frontend/video_page") // path to folder with HTML file

db.initDB();
// db.deleteTable('videos');
// db.clearTable();

app.use(express.json({limit: "100mb"})); // to parse application/json
app.use(express.urlencoded({ limit: "100mb",extended: true })); // to parse application/x-www-form-urlencoded
app.use('/',express.static(clientApp,{ extensions: ["html"] }));
app.use('/video',express.static(videoPage,{extensions: ["html"]}));

app.route('/upload').post(async (req,res) =>  {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err,fields,file) => {
        var name = fields.videoName;
        var description = fields.videoDescription;
        var id = uuidv4();
        var filepath = file.video.filepath;
        // Put the video on server's uploads directory, then send to S3, then delete from the server
        if(!fs.existsSync('./uploads'))
            fs.mkdirSync('./uploads')
        var newpath = './uploads/' + id + '.' + file.video.originalFilename.split('.')[1];
        var thumbnailPath = './uploads/' + id + '-thumbnail.jpg';
        fs.renameSync(filepath,newpath);
        var videoFile = fs.readFileSync(newpath);
        var duration = parseInt(await getVideoDurationInSeconds(newpath));
        await extractFrames({
            input: newpath,
            output: thumbnailPath,
            offsets: [
                Math.floor(duration/2) // Get frame from the middle of the video
            ]
        });
        var thumbnailFile = fs.readFileSync(thumbnailPath);
        var obj = {
            id: id,
            name: name,
            description: description,
            duration: duration
        };
        db.addVideo(obj).then(()=>{
            s3.putObject({
                Bucket: 'video-bucket-videostream',
                Key: `videos/${id}.${file.video.originalFilename.split('.')[1]}`,
                Body: videoFile
            }).promise().then(() => {
                fs.unlinkSync(newpath);
                s3.putObject({
                    Bucket: 'video-bucket-videostream',
                    Key: `thumbnails/${id}-thumbnail.jpg`,
                    Body: thumbnailFile
                }).promise().then(() => {
                    fs.unlinkSync(thumbnailPath);
                    res.send(obj);
                })
            })

        })
    })
});

app.route('/getVideos').get((req,res) => {
    db.getAllVideos().then((responseText)=>{
        res.send(responseText);
    });
});

app.route('/getVideoName/:id').get((req,res) => {
    const id = req.params.id;
    const params = {
        Bucket: 'video-bucket-videostream',
        MaxKeys: '1',
        Prefix: 'videos/' + id
    }
    s3.listObjects(params, (err,data) => {
        if(err)
            res.send(err);
        res.send(data.Contents[0].Key);
    })
})

app.route('/getVideoData/:id').get((req,res) => {
    const id = req.params.id;
    db.getVideoData(id).then((responseText) => {
        res.send(responseText[0]);
    })
})

app.route('/search').post((req,res) => {
    const str = req.body.search;
    db.searchVideos(str).then((responseText)=>{
        res.send(responseText);
    });
})

app.listen(port,()=>{console.log(`Serving on port ${port}`)});
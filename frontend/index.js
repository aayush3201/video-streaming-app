// Helper function to make GET requests
const getRequest = (endpoint,content) => {
    return new Promise((resolve,reject)=>{
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `${window.location.origin}${endpoint}`);
        xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText))
        };
        if(content)
            xhr.send(content)
        else    
            xhr.send();
    });
}

// Helper function to make GET requests
const postRequest = (endpoint,content) => {
    return new Promise((resolve,reject)=>{
        var xhr = new XMLHttpRequest();
        xhr.open("POST", `${window.location.origin}${endpoint}`);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onload = () => {
            if(xhr.status == 200){
                console.log("POST Successful");
                resolve(xhr.responseText);
            }
        }
        xhr.send(JSON.stringify(content));
    });
}

const formDuration = (duration) => {
    var hour = Math.floor(duration/3600);
    var min = Math.floor(duration%3600/60);
    var sec = Math.floor(duration%3600%60);
    hour = hour<10?'0'+hour:''+hour
    min = min<10?'0'+min:''+min
    sec = sec<10?'0'+sec:''+sec
    return `${hour}:${min}:${sec}`;
}

// Creates a DOM element from the given HTML string
function createDOM(htmlString) {
    let template = document.createElement("template");
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
  }

// App code
const appBody = document.querySelector('.app-body');

// Function to render upload page and setup event listeners
const renderUploadPage = () =>{
    appBody.innerHTML = `
    <div class="upload-page">
    <p>Enter the details below:<br/></p>
    <div>
        <label>Title of video:</label>
        <input type="text" placeholder="Enter video title" class="title-box">
        <br/>
    </div>
    <div>
        <label>Enter description of your video:</label>
        <br/>
        <textarea maxlength="16777215" rows="4" cols="50" class="video-description-box"></textarea>
        <br/>
    </div>
    <div>
        <label>Upload File:</label>
        <input type="file" id="videoFile" name="video">
        <br/>
    </div>
    <input type="button" class="submit-upload" value="SUBMIT">
    <input type="button" class="go-back" value="BACK">
    </div>
    <div class="overlay">
    <h1>PLEASE WAIT!</h1>
    </div>
    `;
    const titleBox = document.querySelector('.title-box');
    const videoDescription = document.querySelector('.video-description-box');
    document.querySelector('.go-back').addEventListener('click',renderHomePage);
    const overlay = document.querySelector('.overlay');
    document.querySelector('.submit-upload').addEventListener('click',(event)=>{
        var name = titleBox.value;
        var description = videoDescription.value;
        var file = document.getElementById('videoFile').files[0];
        var formData = new FormData();
        formData.append('videoName',name);
        formData.append('videoDescription',description);
        formData.append('video',file);
        overlay.style.display = 'block'; // prevents multiple upload clicks
        fetch(window.location.origin +'/upload', {
            method: "POST",
            body: formData
        }).then((result)=>{
            renderHomePage();
            alert('Video uploaded!');
        })
    });
}

// Function to render home page and setup event listeners
const renderHomePage = () => {
    appBody.innerHTML = `
    <div class="search-and-upload">
    <input type="button" value="UPLOAD" class="upload-button">
    <div class="search">
        <input type="text" placeholder="Enter video name..." class="search-box">
        <input type="button" value="Go!" class="search-button">
    </div>
    </div>
    <div class="video-list-container">
    <ul class="video-list">
    </ul>
    </div>
    `;
    getRequest('/getVideos').then((res)=>{
        renderVideoList(res);
    });
    const uploadButton = document.querySelector('.upload-button');
    uploadButton.addEventListener('click', renderUploadPage)
    document.querySelector('.search-button').addEventListener('click', () => {
        const str = document.querySelector('.search-box').value;
        fetch(window.location.origin + '/search', {
            method: "POST",
            body: JSON.stringify({
                search: str
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res)=>{
            res.json().then((obj)=>{
                renderVideoList(obj);
            });
        });
    });
}

const renderVideoList = (videos) => {
    document.querySelector('.video-list').innerHTML = '';
    for(const video of videos){
        var listItem = createDOM(`
        <li class="video-list-item">
        <img alt="Thumbnail" src="https://video-bucket-videostream.s3.ca-central-1.amazonaws.com/thumbnails/${video.id}-thumbnail.jpg" width="100" height="100">
        <div class="video-details">
        <h3>${video.name}</h3>
        <p>${video.description}</p>
        <p>Duration: ${formDuration(video.duration)}</p>
        </div>
        </li>
        `);
        listItem.video_id = video.id;
        document.querySelector('.video-list').appendChild(listItem);
    }
    document.querySelectorAll('.video-list-item').forEach((item) => {
        item.addEventListener('click',(event)=>{
            var target = event.target
            while(!target.classList.contains('video-list-item')){
                target = target.parentElement;
            }
            window.location = `${window.location.origin}/video?id=${target.video_id}`
        });
    });
}

renderHomePage();
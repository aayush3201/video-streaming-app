// Helper function to make GET requests
const getRequest = (endpoint) => {
    return new Promise((resolve,reject)=>{
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `${window.location.origin}${endpoint}`);
        xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText))
        };
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
        <label>Enter descripion of your video:</label>
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
    `;
    const titleBox = document.querySelector('.title-box');
    const videoDescription = document.querySelector('.video-description-box');
    document.querySelector('.go-back').addEventListener('click',renderHomePage);
    document.querySelector('.submit-upload').addEventListener('click',()=>{
        var name = titleBox.value;
        var description = videoDescription.value;
        postRequest('/upload',{name: name, description: description}).then((responseText)=>{
            console.log(responseText);
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
        for(const video of res){
            document.querySelector('.video-list').appendChild(
                createDOM(`
                <li class="video-list-item">
                <img alt="Thumbnail" src="">
                <div class="video-details">
                <h3>${video.name}</h3>
                <p>${video.description}</p>
                <p>Duration: 00:00</p>
                </div>
                </li>
                `)
            )
        }
    })
    const uploadButton = document.querySelector('.upload-button');
    uploadButton.addEventListener('click', renderUploadPage)
}

renderHomePage();
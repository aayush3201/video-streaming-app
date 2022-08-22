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
                resolve();
            }
        }
        xhr.send(JSON.stringify(content));
    });
}

const uploadButton = document.querySelector('.upload-button');
const appBody = document.querySelector('.app-body');

uploadButton.addEventListener('click',() => {
    appBody.innerHTML = `
    <div class="upload-page">
    <p>Enter the details below:<br/></p>
    <div>
        <label>Title of video:</label>
        <input type="text" placeholder="Enter video title">
        <br/>
    </div>
    <div>
        <label>Enter descripion of your video:</label>
        <br/>
        <textarea maxlength="16,777,215" rows="4" cols="50"></textarea>
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
})
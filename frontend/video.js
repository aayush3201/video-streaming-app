// Helper function to make GET requests
const getRequest = (endpoint,parseJSON) => {
    return new Promise((resolve,reject)=>{
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `${window.location.origin}${endpoint}`);
        xhr.onload = () => {
            if(parseJSON == true)
                resolve(JSON.parse(xhr.responseText));
            else resolve(xhr.responseText);
        };
        xhr.send();
    });
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');
const videoScreen = document.querySelector('.video-screen');
// First we need the name of the video (we do not know the extension), then we add it's src to the video element
getRequest(`/getVideoName/${id}`,false).then((responseText) => {
    videoScreen.src = `https://video-bucket-videostream.s3.ca-central-1.amazonaws.com/${responseText}`;
});
// We will also need the name and description of the video
getRequest(`/getVideoData/${id}`,true).then((obj) => {
    document.querySelector('.vid-page-title').textContent = obj.name;
    document.querySelector('.vid-page-description').textContent = obj.description;
})
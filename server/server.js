const express = require('express');
const path = require("path");
const app = express();
const port = 3000;
const clientApp = path.join(__dirname, "../frontend"); // path to folder with the HTML file

app.use(express.json()); // to parse application/json
app.use(express.urlencoded({ extended: true })); // to parse application/x-www-form-urlencoded
app.use('/',express.static(clientApp,{ extensions: ["html"] }));

app.listen(port,()=>{console.log(`Serving on port ${port}`)});
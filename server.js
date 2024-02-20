const express = require('express');
const bodyParser = require('body-parser')
const http = require('http');
const path = require("path");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// for parsing application/json
app.use(express.json()); 

// Set EJS as templating engine 
app.set('view engine', 'ejs');

// render ejs template
// app.get('/', (req, res) => { 
//   res.send('All Set');
// });

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// for parsing multipart/form-data
app.use("/uploads",express.static('uploads')); 


app.use(require("./server/src"));
app.use(express.static(path.join(__dirname,"./build")));

app.get('*' , async (req,res) => {
  res.sendFile(path.resolve(__dirname,"./build","index.html"));
})

app.use(cors());
// Include Services API File


const PORT = process.env.PORT || 3001;

let envVariable = process.env.ENV;

if(envVariable == 'local'){

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}
else if(envVariable == 'development'){

  const httpsServer = https.createServer(
    {
      cert: fs.readFileSync("/etc/apache2/ssl/STAR_brstdev_com.crt"),
      ca: fs.readFileSync("/etc/apache2/ssl/My_CA_Bundle.ca-bundle"),
      key: fs.readFileSync("/etc/apache2/ssl/private.key"),
    },
    app
  );

  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on PORT ${PORT}`);
  });

} 
else if(envVariable == 'production'){

 const httpsServer = https.createServer(
    {
      cert: fs.readFileSync("/etc/apache2/ssl/STAR_brstdev_com.crt"),
      ca: fs.readFileSync("/etc/apache2/ssl/My_CA_Bundle.ca-bundle"),
      key: fs.readFileSync("/etc/apache2/ssl/private.key"),
    },
    app
  );
  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on PORT ${PORT}`);
  });

} 

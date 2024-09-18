const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");

const routers = require('./routes/routers');

const allowedOrigins = ['www.joincfd.com', 'www.cfdcompanies.com', 'www.cfdinvestments.com', 'localhost', 'www.cfd-companies.com', 'www.cognitoforms.com'];
app.use(cors({
  origin: function(origin, callback){
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }

}));

app.use(express.json());
app.use(express.static("public"));

app.get('/routers/:router/:method', routers);
app.post('/routers/:router/:method', routers);

(async () => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();



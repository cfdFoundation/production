const express = require("express");
const app = express();
const port = 8080;

const routers = require('./routes/routers');

app.use(express.json());
app.use(express.static("public"));

app.get('/routers/:router/:method', routers);
app.post('/routers/:router/:method', routers);

(async () => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();



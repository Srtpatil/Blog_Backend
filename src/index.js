const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send({
    msg: "Hello World!",
  });
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log("Server is up on port ", port);
});

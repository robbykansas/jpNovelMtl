const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');
const PORT = process.env.PORT || 3000

app.use(bodyParser.json({limit: "200kb"}))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(routes)
app.use(express.json())

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
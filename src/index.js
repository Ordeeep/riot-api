const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes')

app.use(cors());
require('dotenv').config();

//Declando váriveis de ambiente.
const PORT = process.env.PORT; //Porta que irá rodar a aplicação

app.use(routes);

app.listen(PORT, (error) => {
   if (error) {
      console.log(error)
   } console.log(`Server is running: http://localhost:${PORT}`)
})
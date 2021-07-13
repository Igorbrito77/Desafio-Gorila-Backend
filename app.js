
const express = require('express');
const app = express();
const cors = require('cors');


app.use(cors());
// app.use(process.env.VERSAO, subpath);


function calculo_cdb(req, res){

    const investmentDate = '2016-11-14';
    const currentDate = '2016-12-26';
    const cdbRate =  103.5;


    // adicionar validação de data e conversão pra padrão





    res.json({mensagem : "Teste"});
}


app.get('/cdb/:data', calculo_cdb);




app.listen(3000);




module.exports = app;

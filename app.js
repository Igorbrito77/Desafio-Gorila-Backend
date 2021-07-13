
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs')
const neatCsv = require('neat-csv');

app.use(cors());


var getDaysArray = function(start, end) {

    end = new Date(end)


    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
};


async function calculo_cdb(req, res){

    const investmentDate = '2016-11-14';
    const currentDate = '2016-12-26';
    const cdbRate =  103.5;


    // adicionar validação de data e conversão pra padrão
    
    const array_datas = getDaysArray('2021-01-01', '2021-02-01');

    
    const dados_cdi = await neatCsv(fs.readFileSync('./CDI_Prices.csv'))


    // for(let data of array_datas){



    // }


    res.json({mensagem : "Teste"});
}


app.get('/cdb/:data', calculo_cdb);




app.listen(3000);




module.exports = app;

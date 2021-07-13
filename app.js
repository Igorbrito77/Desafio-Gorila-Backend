
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs')
const neatCsv = require('neat-csv');

app.use(cors());


var getDaysArray = function(start, end) {

    end = new Date(end)


    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        let nv_data = new Date(dt);
        arr.push(nv_data.getDate()+'/'+(nv_data.getMonth()+1)+'/'+nv_data.getFullYear());
    }
    return arr;
};


async function calculo_cdb(req, res){

    const investmentDate = '2016-11-14';
    const currentDate = '2016-12-26';
    const cdbRate =  103.5;


    // adicionar validação de data e conversão pra padrão
    
    const array_datas = getDaysArray(investmentDate, currentDate);
    
    const dados_cdi = await neatCsv(fs.readFileSync('./CDI_Prices.csv'))

    let valores_cdb = [];


    for(let data of array_datas){

        // pega o valor do CDI do dia
        let cdi_diario = dados_cdi.find( dado_cdi => {
            return dado_cdi.dtDate === data
        });

        cdi_diario = cdi_diario ? cdi_diario.dtDate : null; 

        valores_cdb.push({date: data, unitPrice: cdi_diario})

    }


    res.json(valores_cdb);
}


app.get('/cdb/:data', calculo_cdb);




app.listen(3000);




module.exports = app;

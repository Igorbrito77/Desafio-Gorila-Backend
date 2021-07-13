
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs')
const neatCsv = require('neat-csv');

app.use(cors());


function __formatDateToBD(dateString) {
    if (dateString != null && dateString != ``) {
        var dateSplit = dateString.split(` `);
        var day = dateSplit[0].split(`/`).reverse().join(`-`);
        if (dateSplit.length == 2) {
            var hour = dateSplit[1];
            return day + ` ` + hour;
        } else {
            return day;
        }
    } else {
        return dateString;
    }
}

// var getDaysArray = function(start, end) {

//     start = new Date(start)
//     end = new Date(end)

//     let arr=[];

//     for(let dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
//         let nv_data = new Date(dt);
//         arr.push(nv_data.getDate()+'/'+(nv_data.getMonth()+1)+'/'+nv_data.getFullYear());
//     }
//     return arr;
// };




const getDatesBetweenDates = (startDate, endDate) => {
    let dates = []

    const theDate = new Date(startDate)
    endDate = new Date(endDate)

    while (theDate < endDate) {


        let data_pronta = theDate.getFullYear()+'-'+(theDate.getMonth()+1);

        data_pronta +=   parseInt(theDate.getDate()) < 10 ?  `-0${theDate.getDate()}` : `-${theDate.getDate()}`;

        theDate.setDate(theDate.getDate() + 1)

        dates.push(data_pronta)
    }
    return dates
    
  }
  


async function calculo_cdb(req, res){

    const investmentDate = '2016-11-14';
    const currentDate = '2016-12-26';
    const cdbRate =  103.5;


    // adicionar validação de data e conversão pra padrão
    
    const array_datas = getDatesBetweenDates(investmentDate, currentDate);
    
    const dados_cdi = await neatCsv(fs.readFileSync('./CDI_Prices.csv'))

    let valores_cdb = [];

    let tcdi_k_acumulado = 1;

    for (let data of array_datas){  


        let dado_diario = dados_cdi.find( dado_cdi => {
            return data === __formatDateToBD(dado_cdi.dtDate);
        });


        let cdi_diario,  tcdi_k;


        if(dado_diario){

            cdi_diario =  dado_diario.dLastTradePrice;

            tcdi_k=  parseFloat(Math.pow( parseFloat( parseFloat( cdi_diario/100 ) +1) , 1/252) -1);

            tcdi_k_acumulado = parseFloat( tcdi_k_acumulado *   parseFloat(1 +  parseFloat(tcdi_k * ( parseFloat(cdbRate/100) )  ) ) );


            valores_cdb.push({date: data, data_csv: dado_diario.dtDate,  cdi_diario, unitPrice : tcdi_k, tcdi_k_acumulado})
        }



    }

    res.json(valores_cdb);
}


app.get('/cdb/:data', calculo_cdb);




app.listen(3000);




module.exports = app;

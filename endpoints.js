const fs = require('fs')
const neatCsv = require('neat-csv');

module.exports = function (app) {



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



// Retorna um array contendo as datas entre a data incial do investimento e a data atual
function getDatesBetweenDates(startDate, endDate){
    
    const dt = new Date(startDate)
    endDate = new Date(endDate)

    let dates = []

    while (dt < endDate) {

        dates.push( dt.getFullYear()+'-'+(dt.getMonth()+1) +  ( parseInt(dt.getDate()) < 10 ?  `-0${dt.getDate()}` : `-${dt.getDate()}` ));

        dt.setDate(dt.getDate() + 1)

    }

    return dates
    
  }
  

function calculo_cdb(cdbRate, dates, dados_cdi){

    let valores_cdb = [];

    let tcdi_k_acumulado = 1;
 
    for (let data of dates){  
 

        let dado_diario = dados_cdi.find( dado_cdi => {
            return data === __formatDateToBD(dado_cdi.dtDate);
        });
 
 
        let cdi_diario,  tcdi_k;
 
 
        if(dado_diario){
 
            cdi_diario =  parseFloat(dado_diario.dLastTradePrice).toFixed(2);
 
            tcdi_k=  parseFloat(Math.pow( parseFloat( parseFloat( cdi_diario/100 ) +1) , 1/252) -1).toFixed(8);
 
            tcdi_k_acumulado = parseFloat( tcdi_k_acumulado *   parseFloat(1 +  parseFloat(tcdi_k * ( parseFloat(cdbRate/100) )  ) ) ).toFixed(8);
 
 
            valores_cdb.push({date: data, data_csv: dado_diario.dtDate,  cdi_diario, unitPrice : tcdi_k, tcdi_k_acumulado})
        }

    }

    return valores_cdb;
}


app.get('/cdb', async (req, res) => {
        
    try{

      // #swagger.tags = ['User']
        // #swagger.description = 'Cáluco de CDB pós indexado ao CDI.'

        /* #swagger.parameters['investmentDate'] = {
               description: 'Data inicial do investimento.',
               type: 'string',
               required: true
        } */

         /* #swagger.parameters['currentDate'] = {
               description: 'Data atual.',
               type: 'string',
               required: true
        } */

        /* #swagger.parameters['cdbRate'] = {
               description: 'Taxa do CDB',
               type: 'string',
               required: true
        } */

        const investmentDate =   req.query.investmentDate;
        const currentDate =      req.query.currentDate;
        const cdbRate =          req.query.cdbRate;  


        // adicionar validação de data e conversão pra padrão
        
        const dates = getDatesBetweenDates( investmentDate, currentDate);
        
        const dados_cdi = await neatCsv(fs.readFileSync('./CDI_Prices.csv')) // Lê o arquivo CSV da série histórica do CDI e o converte em um array de objetos 

                
        const result = calculo_cdb(cdbRate, dates, dados_cdi);
        

        return res.status(200).send(result)

    }

    catch(err){
        return res.status(500).send({message: err.stack})
    }

})


    

}
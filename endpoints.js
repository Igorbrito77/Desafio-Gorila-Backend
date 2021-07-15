const fs = require('fs')
const neatCsv = require('neat-csv');
const moment = require('moment')

module.exports = function (app) {


const PRECO_UNITARIO_CDB = 1000;


// Converte as data do formato DD/MM/YYYYY para YYYY-MM-DD
function format_date(dateString) { 

    let dateSplit = dateString.split(` `);

    let day = dateSplit[0].split(`/`).reverse().join(`-`);
    
    if (dateSplit.length == 2) {
        let hour = dateSplit[1];
        return day + ` ` + hour;
    } 
    
    else {
        return day;
    }
}



// Retorna um array contendo as datas entre a data incial do investimento e a data atual
function get_dates_between_dates(startDate, endDate){
    
    const dt = new Date(startDate)
    endDate = new Date(endDate)


    let dates = []

    while (dt < endDate) {

        dates.push(moment(dt).format('YYYY-MM-DD'));

        dt.setDate(dt.getDate() + 1)

    }

    return dates
    
  }
  

// Efetua o cálculo do CDB
function calculo_cdb(cdbRate, dates, cdiValuesList){

    let priceList = []; // Array de preços do CDB
    let TCDIk_acumulado = 1.
    let TCDIk;
 
    for (let date of dates){  
 
        let CDI = cdiValuesList.find( dado_cdi => { return date === format_date(dado_cdi.dtDate); }); // busca o valor do CDI na determinada data

 
        if(CDI){ // verifica se um valor foi encontrado  (pois só são contabilizados os dias úteis)
 
            CDI.dLastTradePrice =  parseFloat(CDI.dLastTradePrice).toFixed(2); // fixa o valor de CDI em duas casas decimais
 
            TCDIk=  parseFloat(Math.pow( parseFloat( parseFloat( CDI.dLastTradePrice/100 ) +1) , 1/252) -1).toFixed(8); // Calcula o TCDIk
 
            TCDIk_acumulado = parseFloat( TCDIk_acumulado *   parseFloat(1 +  parseFloat(TCDIk * ( parseFloat(cdbRate/100) )  ) ) ).toFixed(8);  // Calcula o TCDIk acumulado
 
 
            // priceList.push({date, cdi: CDI.dLastTradePrice, unitPrice : TCDIk, TCDIk_acumulado}); Comentando campos inutilizados no retorno  do JSON, mas que seriam utilizados na tabela do Front-End
            priceList.push({date, unitPrice: (TCDIk_acumulado * PRECO_UNITARIO_CDB) });

        }

    }

    return priceList;
}


app.get('/cdb', async (req, res) => {
        
    try{

      // #swagger.tags = ['CDB']
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
               description: 'Taxa do CDB.',
               type: 'string',
               required: true
        } */

        const investmentDate =   req.query.investmentDate;
        const currentDate =      req.query.currentDate;
        const cdbRate =          req.query.cdbRate;  


        // adicionar validação de data e conversão pra padrão
        
        const dates = get_dates_between_dates( investmentDate, currentDate);
        
        const cdiValuesList = await neatCsv(fs.readFileSync('./CDI_Prices.csv')); // Lê o arquivo CSV da série histórica do CDI e o converte em um array de objetos 
                
        const result = calculo_cdb(cdbRate, dates, cdiValuesList); // Chama a função de cálculo para o preço do CDB


        if(result.length === 0){
            return res.status(404).send({message: 'Nenhum dado encontrado na lista de CDI no intervalo de datas informado'});
        }

        const valores = result.map( value => {return{date: value.date, unitPrice: value.unitPrice }})


        return res.status(200).send(valores)

    }

    catch(err){
        return res.status(500).send({message: err.stack})
    }

})


    

}
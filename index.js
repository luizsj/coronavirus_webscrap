request = require('sync-request');
fs = require('fs');

const content = get_wm_content('wo_global.txt', 'https://www.worldometers.info/coronavirus/');
const casesDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-cases-daily',");
const deathsDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-deaths-daily',");
console.log(deathsDaily);

function get_wm_data_chart(content, strIdentifyChart)
{   let casesDailyStart = 0;
    let casesDailyEnd = 0;
    let contentCasesDaily = '';
    let contentJS = new Object;
    let dates = [];
    let values = [];
    let dataMapped = new Object;
    casesDailyStart = content.indexOf(strIdentifyChart);
    //cortar o conteudo deste ponto até o final
    content = content.substring(casesDailyStart, content.length);
    //localizar a string </script> que marca o fim da função
    casesDailyEnd = content.indexOf('function(chart)')-15;

    casesDailyStart = strIdentifyChart.length;
    contentCasesDaily = content.substring(casesDailyStart, casesDailyEnd).trim();
    eval(" contentJS = "+contentCasesDaily);

    dates = contentJS.xAxis.categories;
    values = contentJS.series[0].data;
    for (let i=0; i < dates.length; i++)
        {   dataMapped[dates[i]] = values[i];
        }
    return dataMapped;
}

function get_wm_content(filename, url) {
    //ler o conteudo do worldometers global para um arquivo, se não existir
    //devolver string com o conteudo
    let fexist, content; 
    
    if (!fs.existsSync(filename)) {
        try {
            content = request('GET', url).body.toString();
            fs.writeFileSync(filename, content);
            console.log('arquivo criado');
        } catch (e)
            {}
    } else {
            console.log('arquivo já existe');
            content = fs.readFileSync(filename).toString();
    }
    return content;
}


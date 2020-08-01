request = require('sync-request');
fs = require('fs');

//set X hours for minimum new web scrap
//before this time, use last txt file instead
const minHoursForNewWebScrap = 12; 
const baseUrl = 'https://www.worldometers.info/coronavirus/';

const content = get_wm_content('wo_global.txt', baseUrl, minHoursForNewWebScrap);

const casesDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-cases-daily',");
const deathsDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-deaths-daily',");
const countriesList = get_wm_data_countries_list(content);

function get_wm_data_countries_list(content)
{   //search the content for table of countries
    

}

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

function get_wm_content(filename, url, minHours) 
{
    //ler o conteudo do worldometers global para um arquivo
    //, se não existir ou se existir mas estiver expirado 
    //devolver string com o conteudo
    let fexist, content; 
    let fexpired = true;

    fexist = fs.existsSync(filename);
    if (fexist) {
        modifiedAt = fs.statSync(filename).mtimeMs;
        difference = (Date.now() - modifiedAt) / (60*60*1000);
        console.log('hours of last '+filename+' file: '+difference.toFixed(1));
        fexpired = difference >= minHours;
    }
        

    if ((!fexist) || (fexpired) ) {
        try {
            content = request('GET', url).body.toString();
            fs.writeFileSync(filename, content);
            console.log('novo arquivo criado');
        } catch (e)
            {}
    } else {
            console.log('usando arquivo já existente');
            content = fs.readFileSync(filename).toString();
    }
    return content;
}


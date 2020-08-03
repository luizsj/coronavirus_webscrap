request = require('sync-request');
fs = require('fs');
const {Tabletojson: tabletojson} = require('tabletojson');
        //found at https://www.npmjs.com/package/tabletojson

//set X hours for minimum new web scrap
//before this time, use last txt file instead
const minHoursForNewWebScrap = 48; 
const baseUrl = 'https://www.worldometers.info/coronavirus/';

const content = get_wm_content('wo_global.txt', baseUrl, minHoursForNewWebScrap);

const casesDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-cases-daily',");
const deathsDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-deaths-daily',");

//only retrieves countries with a mininum of 10 deaths in total
const countriesList = get_wm_data_countries_list(content);

const countriesListWithData = get_wm_countries_data(countriesList, baseUrl, minHoursForNewWebScrap);

let jsonContent = JSON.stringify(countriesListWithData);
fs.writeFile("countriesListWithData.js", jsonContent, 'utf8');

function get_wm_countries_data(countriesList, baseUrl, minHoursForNewWebScrap)
{   let i = 0;
    
    for (i=0; i < countriesList.length; i++)
    //for (i=0; i < 3; i++)
        {   let country = countriesList[i];
            let countryName = country.countryName;
            let filename = 'countries/'+countryName.replace(/ /g, '_')+'.txt';
            let content = get_wm_content(filename, baseUrl+country.countryLink, minHoursForNewWebScrap);
            countriesList[i].casesDaily = get_wm_data_chart(content, "Highcharts.chart('graph-cases-daily',");
            countriesList[i].deathsDaily = get_wm_data_chart(content, "Highcharts.chart('graph-deaths-daily',");
        }
    return countriesList;
}

function get_wm_data_countries_list(content)
{   //search the content for table of countries
    objTable = get_wm_data_object_from_table(content, "<table id=\"main_table_countries_today\"");
    countriesCleaned = get_wm_data_countries_list_only_essential_data(objTable);

    return countriesCleaned;
}

function get_wm_data_countries_list_only_essential_data(objTable) {
    //now objTable is a array in which index is a country in key/value structure
    //need simplify this, getting only essential data
    //      countryName, countryLink, TotalCases, TotalDeaths, Population
    //console.log(objTable[0]);
    //Object have commas in some keys (wtf?)
    let countriesFinal = [];
    for (let i=0; i < objTable.length; i++)
        {   
            let objCountry = objTable[i];
            //console.log(objCountry);
            //need use values(objCountry) because the country property contains a comma
            //          and I don't know how to reference it directly -- objCountry.'Country,Other' ??? wtf ???
            //          maybe I should treat it before use tabletojson ???
            let values = Object.values(objCountry);
            let valueLinkAndName = values[1];
            
            let country = new Object;
            if (valueLinkAndName.includes('href')) 
                {   country = get_wm_data_countries_list_only_essential_data_return_link_and_name(valueLinkAndName);
                    country.totalCases = parseInt(objCountry.TotalCases.replace(/,/g, ''));
                    country.totalDeaths = parseInt(objCountry.TotalDeaths.replace(/,/g, ''));
                    country.population = get_wm_data_countries_list_only_essential_data_return_population(objCountry.Population);
                    if ( country.totalDeaths >= 10 )
                        {   countriesFinal[countriesFinal.length] = country; }
                }
        }
    console.log(countriesFinal);
    console.log(countriesFinal.length +' total countries listed');
    return countriesFinal;
}

function get_wm_data_countries_list_only_essential_data_return_population(value)
{   //cut the href for link
    let startValue = value.indexOf("/\">")+3;
    //console.log(value, startValue);
    value = value.substring(startValue, value.length-4);
    value = parseInt(value.replace(/,/g, ''));
    return value;
}

function get_wm_data_countries_list_only_essential_data_return_link_and_name(value)
{
    //cut the href for link
    //console.log(value);
    let startHref = value.indexOf("href")+6;
    let endHref = value.indexOf("/\">")+1;
    let countryLink = value.substring(startHref, endHref);
    let countryName = value.substring(endHref+2, value.length-4);
    //console.log(countryName, countryLink);
    let item = new Object();
    item.countryName = countryName;
    item.countryLink = countryLink;
    return item;
}

function get_wm_data_object_from_table(content, strIdentifyTable)
{
    const startTable = content.indexOf(strIdentifyTable);
    //cortar o conteudo deste ponto até o final
    content = content.substring(startTable, content.length);
    const endTable = content.indexOf("</table>")+8;
    const contentTable = content.substring(0, endTable);

    let converted = tabletojson.convert(contentTable,  { stripHtmlFromCells: false });
    //first index IS the table data
    converted = converted[0];
    //remove first index - world global data
    converted.shift();

    return converted;
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
    //localizar a string  que marca o fim da função
    casesDailyEnd = content.indexOf('function(chart)')-1;
    casesDailyStart = strIdentifyChart.length;
    contentCasesDaily = content.substring(casesDailyStart, casesDailyEnd).trim();
    contentCasesDaily = contentCasesDaily.substring(0, contentCasesDaily.length-1);
    
    //console.log(contentCasesDaily);
    
    eval(" contentJS = "+contentCasesDaily);
    
    dates = contentJS.xAxis.categories;
    values = contentJS.series[0].data;
    for (let i=0; i < dates.length; i++)
        {   dataMapped[dates[i]] = values[i] ? values[i] : 0;  //return 0 when value is null
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
            console.log('new file '+filename+' created');
        } catch (e)
            {}
    } else {
            console.log('use last '+filename+' file');
            content = fs.readFileSync(filename).toString();
    }
    return content;
}


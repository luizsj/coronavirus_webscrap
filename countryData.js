
    request = require('sync-request');
    fs = require('fs');
    const {Tabletojson: tabletojson} = require('tabletojson');
            //found at https://www.npmjs.com/package/tabletojson

    //set X hours for minimum new web scrap
    //before this time, use last txt file instead
    const minHoursForNewWebScrap = 12; 
    const baseUrl = 'https://www.worldometers.info/coronavirus/';

    exports.getCountryData = function (numOfCountries, forceData) {
        const content = get_wm_content('wo_global.txt', baseUrl, minHoursForNewWebScrap);

        const casesDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-cases-daily',", new Object());
        const deathsDaily = get_wm_data_chart(content, "Highcharts.chart('coronavirus-deaths-daily',", new Object());
    
        //only retrieves countries with a mininum of 10 deaths in total        
        const countriesList = get_wm_data_countries_list(content, numOfCountries);
        
        return get_wm_countries_data(countriesList, baseUrl, minHoursForNewWebScrap, numOfCountries, forceData);
    }

function get_wm_countries_data(countriesList, baseUrl, minHoursForNewWebScrap, numOfCountries, forceData)
{   let i = 0;
    
    
    let maxCountry = numOfCountries > countriesList.length ? countriesList.length : numOfCountries;
    for (i=0; i < maxCountry; i++)
        {   let country = countriesList[i];
            let countryName = country.countryName;
            let filename = 'countries/'+countryName.replace(/ /g, '_')+'.txt';
            let content = get_wm_content(filename, baseUrl+country.countryLink, minHoursForNewWebScrap);
            let forceCases = (countryName != 'Brazil')  ? new Object() : forceData.cases;
            let forceDeaths = (countryName != 'Brazil')  ? new Object() : forceData.deaths;
            countriesList[i].casesDaily = get_wm_data_chart(content, "Highcharts.chart('graph-cases-daily',", forceCases);
            countriesList[i].deathsDaily = get_wm_data_chart(content, "Highcharts.chart('graph-deaths-daily',", forceDeaths);
        }
    return countriesList;
}

function get_wm_data_countries_list(content, numOfCountries)
{   //search the content for table of countries
    objTable = get_wm_data_object_from_table(content, "<table id=\"main_table_countries_today\"");
    countriesCleaned = get_wm_data_countries_list_only_essential_data(objTable, numOfCountries);

    return countriesCleaned;
}

function get_wm_data_countries_list_only_essential_data(objTable, numOfCountries) {
    //now objTable is a array in which index is a country in key/value structure
    //need simplify this, getting only essential data
    //      countryName, countryLink, TotalCases, TotalDeaths, Population
    //console.log(objTable[0]);
    //Object have commas in some keys (wtf?)
    let countriesFinal = [];
    let maxCountry = numOfCountries > objTable.length ? objTable.length : numOfCountries;

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
                    
                    if (( country.totalDeaths >= 10 ) && (country.population > 1000000))
                        {   //store country with deaths and cases rates
                            country.deathsRate = country.totalDeaths/country.population*1000000;
                            country.casesRate = country.totalCases/country.population*1000000;
                            countriesFinal[countriesFinal.length] = country; 
                        }
                }
        }

    //sort the array countriesFinal by deathsRate decreasing order
    countriesFinal.sort(function(a, b) {
        return b.deathsRate - a.deathsRate;
      });
    
    countriesFinal = countriesFinal.slice(0, maxCountry);

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

function get_wm_data_chart(content, strIdentifyChart, forceData)
{   let casesDailyStart = 0;
    let casesDailyEnd = 0;
    let contentCasesDaily = '';
    let contentJS = new Object;
    let dates = [];
    let values = [];
    let dataMapped = new Array;
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
    
    //dates here are in string format 'mmm dd'
    //for use in calc projections, need a simple way to locate values at actual_date - x days
    //discover that shouldn't use object key/pair (date=value)
    //          i.e. dataMapped[date] = value is a bad idea
    //because objects don't guarantee the order
    //instead, dataMapped should be an array that contains key/value
    //          like dataMapped[index] = { date:  x,  value : y}
    dates = contentJS.xAxis.categories;
    values = contentJS.series[0].data;
    let acumulated = 0;
    let mobileSevenDaysTotal = 0;
    let mobileSevenDaysAverage = 0;

    let hasForcedData = Object.keys(forceData).length > 0;
    if (hasForcedData)
        {   forceDates = Object.keys(forceData);
            console.log('forceDates');
            console.log(forceDates);
        }

    for (let i=0; i < dates.length; i++)
        {   let item = new Object;
            item.date = Date.parse(dates[i]+', 2020');
            //need to know if this date is in forceDates
            let newValue = -1;
            if (hasForcedData) {
                for (j=0; j < forceDates.length; j++) {
                    if (Date.parse(forceDates[j]) == item.date) {
                        newValue = forceData[forceDates[j]];
                        console.log('forced value '+newValue);
                    }
                }
            }
            if (newValue == -1) {
                newValue = values[i] ? values[i] : 0;     //return 0 when value is null
            }
            item.value = newValue;
            acumulated += item.value;
            item.acumulated = acumulated;
            if (i > 0)
                {   mobileSevenDaysTotal += item.value;
                    if ( i <= 6 )
                        {   mobileSevenDaysAverage = parseFloat((mobileSevenDaysTotal/(i+1)).toFixed(2)); }
                    else {  mobileSevenDaysTotal -= dataMapped[i-7].value;
                            mobileSevenDaysAverage = parseFloat((mobileSevenDaysTotal/7).toFixed(2));
                        }
                }
            item.mobileSevenDaysTotal = mobileSevenDaysTotal;
            item.mobileSevenDaysAverage = mobileSevenDaysAverage;
            dataMapped[i] = item;
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


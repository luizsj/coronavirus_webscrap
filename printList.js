exports.PrintList = function (countriesList, onlyBrazil) {
    let countryLength = 0;
    for (i=0; i < countriesList.length; i++)
        {   thisLength = countriesList[i].countryName.length;
            if (thisLength > countryLength) {  countryLength = thisLength; }
        }
    for (i=0; i < countriesList.length; i++)
        {   let country = countriesList[i];
            let deaths = country.deathsDaily;
            let lastitem = deaths[deaths.length-1];
            //console.log('print country '+i+' '+country.countryName);
            thisLength = country.countryName.length;
            spaces = '_'.repeat(countryLength-thisLength);
            deathsRate = country.deathsRate.toFixed(2);
            if (deathsRate < 1000) {  deathsRate = ' '+deathsRate; }
            totalDeaths = Math.round(country.totalDeaths);
            if (totalDeaths < 100000) {  totalDeaths = ' '+totalDeaths; }
            if (totalDeaths < 10000)  {  totalDeaths = ' '+totalDeaths; }
            if (totalDeaths < 1000)   {  totalDeaths = ' '+totalDeaths; }
            if (lastitem.value < 1000)   {  lastitem.value = ' '+lastitem.value; }
            totalCases = Math.round(country.totalCases);
            casesRate = country.casesRate.toFixed(2);
            if ((!onlyBrazil) || (country.countryName == 'Brazil')) {
                //console.log('lastdate');
                //console.log(lastdate);
                datestr = new Date(lastitem.date).toDateString();
                totalCases = Math.round(lastitem.acumulated);
                casesRate = (country.casesRate).toFixed(2);
                mobileAverage = parseFloat(lastitem.mobileSevenDaysAverage).toFixed(0);
                if (mobileAverage < 1000)   {  mobileAverage = ' '+mobileAverage; }
                console.log(country.countryName+spaces + ':' + datestr+' : '+ deathsRate
                            + ' : ' + totalDeaths
                            + ' : ' + Math.round(lastitem.value)
                            + ' : ' + mobileAverage
                            + ' : ' + totalCases
                            + ' : ' + casesRate);
            }
           // console.log(countriesList[i].deathsDaily.slice(-1));
        }
}

exports.PrintListBrazil = function (countriesList, lastRecords) {
    let countryLength = 0;
    let item = new Object();
    for (i=0; i < countriesList.length; i++)
        {   thisLength = countriesList[i].countryName.length;
            if (thisLength > countryLength) {  countryLength = thisLength; }
        }
    for (i=0; i < countriesList.length; i++)
        {   if (countriesList[i].countryName == 'Brazil')
                {   country = countriesList[i];
                    thisLength = country.countryName.length;
                    spaces = '_'.repeat(countryLength-thisLength);
                    let deaths = country.deathsDaily;
                    let cases = country.casesDaily;
                    let start = deaths.length - lastRecords;
                    for (j=start; j < deaths.length; j++)
                        {   item = deaths[j];
                            //console.log(item);
                            //console.log(item.date);
                            datestr = (new Date(item.date)).toDateString();
                            deathsRate = (item.acumulated/country.population*1000000).toFixed(2);
                            if (deathsRate < 1000) {  deathsRate = ' '+deathsRate; }
                            if (item.value < 1000) {  item.value = ' '+item.value; }
                            totalDeaths = item.acumulated;
                            if (totalDeaths < 100000) {  totalDeaths = ' '+totalDeaths; }
                            if (totalDeaths < 10000)  {  totalDeaths = ' '+totalDeaths; }
                            if (totalDeaths < 1000)   {  totalDeaths = ' '+totalDeaths; }
                            totalCases = cases[j].acumulated;
                            casesRate = (cases[j].acumulated/country.population*1000000).toFixed(2);
                            mobileAverage = parseFloat(item.mobileSevenDaysAverage).toFixed(0);
                            if (mobileAverage < 1000)   {  mobileAverage = ' '+mobileAverage; }
                            console.log(country.countryName+spaces + ':' + datestr+' : '+ deathsRate
                                            + ' : ' + totalDeaths
                                            + ' : ' + item.value
                                            + ' : ' + mobileAverage 
                                            + ' : ' + totalCases
                                            + ' : ' + casesRate);
                   // console.log(countriesList[i].deathsDaily.slice(-1));
                        }
                }
        }
}
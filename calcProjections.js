    PrintList = require('./printList.js'); 
    exports.calculateProjections = function (countriesList, qtDays) {
        console.log('start Calc, final list contains '+countriesList.length+' countries');
        countriesList = calc_review_date_consistency(countriesList);
        console.log('start Calc, final list contains '+countriesList.length+' countries');
       
        let countDates = countriesList[0].deathsDaily.length;
        console.log(countriesList[0].deathsDaily[countDates-1]);
        let newDate = countriesList[0].deathsDaily[countDates-1].date;
        console.log('countDates: '+countDates);
        datestr = (new Date(newDate)).toDateString();
        console.log('starting Calculation with last global date '+ datestr);
        console.log('=====================================================');
        console.log('starting Calculation with last global date '+ datestr);
        
        for (let i=0; i < qtDays; i++)
            {   newDate += 24*60*60*1000;
                //new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
                thirdRate = countriesList[2].deathsRate;
                thirdRateCountry = countriesList[2].countryName;
                //console.log('----------------------------------------------');
                //console.log('calc '+(i+1)+' for date '+newDate.toDateString()+' using second rate '+secondRate+' on '+secondRateCountry);
                recalcThirdRate = false;
                for (let j=0; j < countriesList.length; j++)
                    {   countriesList[j] = calc_projection_new_date_for_country(countriesList[j], newDate, countDates, thirdRate);
                    }
                /*  
                commented to maitain secondDeathRate to tax existint in day of calc  
                if (recalcSecondRate) { 
                    countriesList.sort(function(a, b) {
                        return b.deathsRate - a.deathsRate;
                        });
                    secondRate = countriesList[1].deathsRate;
                    newSecondRateCountry = countriesList[1].countryName;
                    if (secondRateCountry != newSecondRateCountry)
                        {   console.log('----------------------------------------------');
                            console.log((new Date(newDate)).toDateString()+'recalcSecondRate: '+secondRate+' for '+countriesList[1].countryName);
                            //PrintList.PrintList(countriesList);
                        }
                } else {
                    //PrintList.PrintList(countriesList, true);
                }
                */
                PrintList.PrintList(countriesList, true);

                countDates += 1;
            }
        countriesList.sort(function(a, b) {
            return b.deathsRate - a.deathsRate;
            });
        return countriesList;
    }

function calc_projection_new_date_for_country(country, newDate, countDates, thirdRate)
{
    //console.log('calc '+(new Date(newDate)).toDateString()+' for '+country.countryName);
    //console.log(country);
    let print_log = (country.countryName == 'Brazil');
    decrease = (Math.round(country.deathsRate) >= Math.round(thirdRate));
    decreaseTax = decrease ? 0.95 : 1.00 ;
    print_log = country.countryName == 'Brazil' ;
    if (country.deathsRate > 1000) 
        {   decreaseTax -= 0.05;  }
    if (country.casesRate > 40000)
        {   decreaseTax -= 0.05;  }
    if (print_log && (decreaseTax != 1))
        {    console.log('deathsReate: '+country.deathsRate+' casesRate: '+country.casesRate);

        }

    country.deathsDaily = calc_projection_new_date_for_country_item(country.deathsDaily, newDate, countDates, print_log, decreaseTax);
    country.casesDaily = calc_projection_new_date_for_country_item(country.casesDaily, newDate, countDates, false, decreaseTax);
    //console.log(Object.keys(country));
    country.totalDeaths = country.deathsDaily[countDates].acumulated;
    country.totalCases  = country.casesDaily[countDates].acumulated;
    country.deathsRate = country.totalDeaths/country.population*(1000000);
    country.casesRate  = country.totalCases /country.population*(1000000);
    if ((country.countryName == 'Brazil') && decrease)
        {  // console.log('Brazil decreasing'); 
        }
    return country;
}

function  calc_projection_new_date_for_country_item(items, newDate, countDates, print_log, decreaseTax)
{   
    let newItem = new Object();
    /*
    console.log('date actual -   : ' + newDate.toDateString());
    console.log('date actual -  7: ' + (new Date(items[countDates- 7].date)).toDateString());
    console.log('date actual - 14: ' + (new Date(items[countDates-14].date)).toDateString());
    console.log('date actual - 21: ' + (new Date(items[countDates-21].date)).toDateString());
    console.log('date actual - 28: ' + (new Date(items[countDates-28].date)).toDateString());
    */
    const lastItem = items[countDates-1];
    const weekOne   = items[countDates- 7];
    const weekTwo   = items[countDates-14];
    const weekThree = items[countDates-21];
    const weekFour  = items[countDates-28];

    let lastAverage = parseFloat(items[countDates-1].mobileSevenDaysAverage);
    //console.log(lastAverage);
    let newValue = 0;
    let tax = 0;
    if (lastAverage >= 14) {
        tax =   (     (weekTwo.value   > 0 ? (weekOne.value/  weekTwo.value  )*3 : 0)
                        + (weekThree.value > 0 ? (weekTwo.value/  weekThree.value)*2 : 0)
                        + (weekFour.value  > 0 ? (weekThree.value/weekFour.value )   : 0)
                    )/6;
                    if (print_log) {
                        console.log('tax: '+tax);                
                        console.log('decreaseTax: '+decreaseTax)
                    }
        tax = tax * decreaseTax;

        newValue = (weekOne.value*tax);
        if (print_log)
            {   console.log('new Value base: '+newValue); }
        if (newValue > lastAverage*1.4) {
            newValue = lastAverage*1.4;
        } else {
            if (newValue < lastAverage*0.6)
                {   newValue = lastAverage*0.6; }
        } 
    } else {    newValue = (lastAverage >= 7) ? weekOne.value*0.9 : weekOne.value*0.8; }
   // if (newValue < 2) {   newValue -= 0.49}
   // newValue = Math.round(newValue);
    let newMobileTotal = lastItem.mobileSevenDaysTotal - weekOne.value + newValue;
    let newMobileAverage = Math.round(newMobileTotal/7*100)/100;
    newItem.date = newDate;
    newItem.value = newValue;
    newItem.acumulated = lastItem.acumulated + newValue;
    newItem.mobileSevenDaysTotal = newMobileTotal;
    newItem.mobileSevenDaysAverage = newMobileAverage;

    if (print_log) {
        console.log('weekOne.value: '+weekOne.value);
        console.log('weekTwo.value: '+weekTwo.value);
        console.log('weekThree.value: '+weekThree.value);
        console.log('weekFour.value: '+weekFour.value);
        console.log('tax: '+tax);
        console.log('newValue: '+newValue);
        console.log('lastMobileTotal: '+lastItem.mobileSevenDaysTotal);
        console.log('newMobileTotal: '+newMobileTotal);
        console.log('newMobileAverage: '+newMobileAverage+ ': '+(newMobileAverage.toFixed(0)) + ': '+(newMobileTotal/7).toFixed(0));
        console.log('lastItemAcumulated: '+lastItem.acumulated);
        console.log('newItemAcumulated: '+ newItem.acumulated);
    }    

    
    items.push(newItem);
    return items;
}

function calc_review_date_consistency(countriesList)
{   //check if all countries contains same size in series of data
    //greetins to https://codeburst.io/javascript-finding-minimum-and-maximum-values-in-an-array-of-objects-329c5c7e22a2
    let minLength = countriesList[0].deathsDaily.length;
    let maxLength = minLength;
    minLength = countriesList.reduce((min, item) => item.deathsDaily.length < min ? item.deathsDaily.length : min, minLength);
    maxLength = countriesList.reduce((max, item) => item.deathsDaily.length > max ? item.deathsDaily.length : max, minLength);
    
    if (minLength < maxLength)
        {   for (i=0; i < countriesList.length; i++)
                {   if (countriesList[i].deathsDaily.length > minLength)
                        {   countriesList[i].deathsDaily = countriesList[i].deathsDaily.slice(0, minLength);
                            countriesList[i].casesDaily  = countriesList[i].casesDaily.slice(0, minLength);
                            console.log('Reduced items in '+countriesList[i].countryName);
                        }
                }
        }
    else {  console.log('Reduce is globally unnecessary'); }
    return countriesList;
}

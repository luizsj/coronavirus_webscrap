countryData = require("./countryData");

let countriesList = countryData.getCountryData(3);

console.log('after Module, final list contains '+countriesList.length+' countries');


//working in function get_wm_data_chart(content, strIdentifyC
//to convert strings 'mmm dd' to real date values
console.log(countriesList[0]);

deaths = countriesList[0].deathsDaily;
console.log('------------------');
console.log(deaths);
lastdate = deaths[deaths.length-1];
console.log(lastdate);
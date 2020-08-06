countryData = require("./countryData");

let countriesList = countryData.getCountryData();

console.log('after Module, final list contains '+countriesList.length+' countries');

//console.log(countriesList[0]);
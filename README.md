# coronavirus_webscrap
Node.js app for webscrapp Coronavirus data from worldometers.info

# Objective
My first node.js app, so is only for studying.
1) Read actual content from https://www.worldometers.info/coronavirus, collecting global data about cases and deaths. 
2) In same content, collect actual data for all countries listed.
3) For each country, 
      3a) open the correspondent page and reads the daily data for them.
      3b) Apply a simple calculation using the average of last 4 weeks to project the evolution.
      3c) Consider the max accepted death/million rate as the actual second major rate between the countries in list
      3d) After reached the 3c rate, continue applying the 3b daily-calc reducing 5% per day.
4) Put the global data, the countries list, country data e projections into json objects, so they could be posted in any database and used in any front-end graphs.

# Calc Projections finished
with some adaptations on item 3 to correct distortions

# Next Steps
1) Export projection result to pure javascript file
2) Develop experimental front-end to show animated evolution of actual projection




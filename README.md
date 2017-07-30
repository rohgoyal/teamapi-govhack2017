# Team API Repo for Govhack2017
We started with Wyndham, Victoria local council data http://data.gov.au/dataset/wyndham-city-hard-rubbish-bookings

We found that number of request for hard rubbish collection were growing every year. We also projected the number of collection in future by understanding the patterns from previous years. We used Google BigQuery to analyse the Data via Google DataStudio. Observation charts are available here. 

https://datastudio.google.com/reporting/0ByKECVErKkmIeXlsc2ZWWDNyT1k/page/liqG
https://datastudio.google.com/reporting/0ByKECVErKkmIeXlsc2ZWWDNyT1k/page/2jqG

So, we noted couple of important problems which needs to be solved to really transform local councils better manage hard waste collection.

1. A better approach for residents to book a collection with councils
2. Councils find efficient ways to manage and collect the hard waste from resident properties.

Solution has 2 important Parts
1. Consumer facing Facebook Page integrated with Amazon Lex Chatbot
https://www.facebook.com/Wyndham-Hard-Rubbish-Collections-767130700127543/

2. Backend Website for Council Staff to view the Bookings and Find the Shortest Route.
https://s3.amazonaws.com/govhack2017/WhatIsMyRoute.html

The picture below explains the components involved as part of the solution
![Alt text](Solution.jpg)
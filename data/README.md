# PeriodO data

## Retrieving the data
The latest (development) version of the PeriodO data can be found here:
https://data.perio.do/d.json

Individual authorities (collections of periods having the same source) can also be directly accessed via URLs like this one for the British
Museum:
http://data.perio.do/8m57h.json

Finally, it is possible for people to create arbitrary “bags” of periods, possibly from different authorities, and these bags also get their own URLs. Here's an example bag with two periods in it:
https://data.perio.do/bags/451e662f-11f9-42c1-8c76-d1a7581226fb.json

## Sample data in this repository
Since this repository focuses on the visualizations, not on data filtering, we have premade data files. Real world use will need to download the data from the PeriodO servers.

data/full.json is the full data
data/authority.json contains an individual authority
data/bag.json contains a single bag

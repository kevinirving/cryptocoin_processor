cryptocoin_processor
====================

Node application that will both gather and process data using mongo db with map reduce capabilities.

Runs gatherer application (moves raw data from cryptocoin markets to mongodb)
```
./main.js gatherer
```


Runs processor application (handles continuous processing of raw data into indicators: candles, macd, etc)
```
./main.js processor
```

Both applications require mongo to be prepopulated with data on which markets and associated credentials to connect with.
You can view current indicators and candlecharts through the panel application (panel/server.js)

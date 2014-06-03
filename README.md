cryptocoin_processor
====================

Node application that will both gather and process data using mongo db with map reduce capabilities.

Runs gatherer application (moves raw data from cryptocoin markets to mongodb)
```
./main.js gatherer
```


Runs processor application (handles continuous processing of raw data into indicators: candles, macd, etc)
```
./main.js gatherer
```

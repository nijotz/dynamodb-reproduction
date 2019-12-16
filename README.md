# Steps To Reproduce

1. Make sure you have docker installed.
2. Copy `newrelic.example.js` to `newrelic.js` and edit the license key
3. run `npm ci` and `npm start`
4. Look at either distributed tracing or one of the transactions in newrelic to see the issue with Database & External

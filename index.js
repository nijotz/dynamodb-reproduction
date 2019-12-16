const nr = require('newrelic');
const { createTable, verifyTable, insertData, fetchData, deleteTable } = require('./lib');

(async function() {
  try {
    await createTable();
    await verifyTable();
    await insertData();
    console.log(await fetchData());
  } catch (e) {
    console.error(e);
  } finally {
    await deleteTable();
    // make sure NR collector runs
    console.log('sleeping 60s to wait for collector');
    await require('util').promisify(setTimeout)(60000);
  }
})();


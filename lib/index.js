const nr = require('newrelic');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
const awaitTimeout = require('util').promisify(setTimeout);

const PORT = 8000;
const ddb = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: `http://localhost:${PORT}`
});

const tableName = 'NRTest';
const keyName = "MYKEY";
const keyValue = uuid();

module.exports.createTable = function createTable() {
  console.log('Creating Table');
  return nr.startBackgroundTransaction('createTable', () => {
    return ddb.createTable({
      AttributeDefinitions: [
        {
          AttributeName: keyName,
          AttributeType: 'S'
        },
      ],
      KeySchema: [
        {
          AttributeName: keyName,
          KeyType: 'HASH'
        },
      ],
      ProvisionedThroughput: {
        "ReadCapacityUnits": 1,
        "WriteCapacityUnits": 1
      },
      TableName: tableName
    }).promise();
  })
};

module.exports.verifyTable = async function verifyTable() {
  console.log('Verifying Table Exists');
  await nr.startBackgroundTransaction('verifyTable', async () => {
    let tableCreated = false;
    while (!tableCreated) {
      let desc = await ddb.describeTable({TableName: tableName}).promise();
      if (desc.Table.TableStatus === 'ACTIVE') { tableCreated = true }
      else {
        console.log('Waiting on table creation');
        await awaitTimeout(1000);
      }
    }
  });
};

module.exports.insertData = function insertData() {
  console.log('Inserting Data');
  return nr.startBackgroundTransaction('insertData', () => {
    return ddb.putItem({
      Item: {
        MYKEY: {
          S: keyValue
        },
        AValue: {
          S: uuid()
        }
      },
      TableName: tableName
    }).promise();
  });
};

module.exports.fetchData = function fetchData() {
  console.log('Fetching Data');
  return nr.startBackgroundTransaction('fetchData', () => {
    return ddb.getItem({
      Key: {
        MYKEY: {
          S: keyValue
        }
      },
      ConsistentRead: true,
      TableName: tableName
    }).promise();
  });
};

module.exports.deleteTable = async function deleteTable() {
  console.log('Deleting Table');
  await nr.startBackgroundTransaction('deleteTable', async () => {
    await ddb.deleteTable({TableName: tableName}).promise();
    let tableDeleted = false;
    while (!tableDeleted) {
      try {
        let desc = await ddb.describeTable({TableName: tableName}).promise();
        if (desc.Table.TableStatus === 'DELETING') {
          console.log('Waiting on table deletion');
          await awaitTimeout(1000);
        }
      } catch(e) {
        if (e.message.match(new RegExp(`.*${tableName} not found`))) {
          tableDeleted = true
        }
      }
    }
  });
};

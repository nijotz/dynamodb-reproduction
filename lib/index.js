const nr = require('newrelic');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

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

module.exports.verifyTable = function verifyTable() {
  console.log('Verifying Table Exists');
  return nr.startBackgroundTransaction('verifyTable',() => {
    return ddb.describeTable({TableName: tableName}).promise();
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

module.exports.deleteTable = function deleteTable() {
  console.log('Deleting Table');
  return nr.startBackgroundTransaction('deleteTable', () => {
    return ddb.deleteTable({TableName: tableName}).promise();
  });
};

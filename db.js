const AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "key",
    secretAccessKey: "secret",
    endpoint: "http://127.0.0.1:8000"
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// Initialization of DB Table "Properties"
async function createDB() {
    console.log("Creating DB. Please wait.")
    const params = {
        TableName : "Properties",
        KeySchema: [
            { AttributeName: "property_id", KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: "property_id", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    try {
        await dynamodb.createTable(params).promise();
    } catch(error) {
        console.log(error)
    }
}

// Loading all property data to DB
function loadDB(data) {
    console.log("Importing properties into DynamoDB. Please wait.")

    data.forEach(property => {
        let params = {
            TableName: "Properties",
            Item: {
                "property_id":  property.property_id,
                "name": property.name,
                "email": property.email,
                "units": property.units,
                "coords": property.coords,
                "weather": property.weather
            }
        };

        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add property", property.property_id, ". Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Put succeeded:", property.property_id);
            }
        });
    })
}

module.exports = {
    createDB,
    loadDB,
    docClient,
    dynamodb
}
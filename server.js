const AWS = require("aws-sdk");
const xml2js = require('xml2js');
const axios = require('axios');
const express = require("express")
const Queue = require('bull')
const {fetchXmlData, parseXmlData, extractFromParsedData} = require("./properties");
const {createDB, loadDB, docClient} = require("./db");

// Initializes Queue for weather updates
const weatherQueue = new Queue("property weather", 'redis://127.0.0.1:6379')

// Fetches xml data, parses xml to object, and creates
// a new property object with required data abstracted from xml

async function init() {
    let data = await fetchXmlData()
    let parsedData = await parseXmlData(data)
    let properties = extractFromParsedData(parsedData)

    // DB creation
    await createDB()
    // DB loading
    loadDB(properties)
}

async function server() {
    try {
        // If init is not successful, exit
        await init()
    } catch(error) {
        console.error(error)
        process.exit(1)
    }

    // Express server
    const app = express()
    const port = 8080

    //middleware
    // parses incoming requests with JSON payloads
    // and is based on body-parser.
    app.use(express.json())

    // Endpoint - get all properties
    app.get('/api/properties', async function (req, res) {
        console.log("Fetching all table data. Please wait.")

        try {
            let params = {
                TableName: "Properties"
            };
            let result = await docClient.scan(params).promise()
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({error: error.message})
            console.error(error.message);
        }
    })

    // Endpoint - get single property
    app.get('/api/properties/:id', async function (req, res) {
        try {
            let params = {
                Key: {
                    property_id: req.params.id
                },
                TableName: "Properties"
            };
            let result = await docClient.get(params).promise()
            res.status(200).json(result)

        } catch (error) {
            res.status(500).json({error: error.message})
            console.error(error.message);
        }
    })

    // Endpoint - adds job to queue
    // The job will be processed by a worker which will
    // fetch property weather and update the weather of that property in DB
    app.post('/api/properties/:id/weather', async function (req, res) {
        try {
            let params = {
                Key: {
                    property_id: req.params.id
                },
                TableName: "Properties"
            };

            let property = await docClient.get(params).promise()
            await weatherQueue.add({type: 'weather update', property: property})
            res.sendStatus(200)
        } catch(error){
            res.status(500).json({error: error.message})
            console.error(error);
        }
    })

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    })
}

if (require.main === module) {
    server();
}
const axios = require("axios");
const xml2js = require("xml2js");

// API request with axios to get xml data
async function fetchXmlData() {
    let url = 'https://s3.amazonaws.com/abodo-misc/sample_abodo_feed.xml'
    let res = await axios.get(url)
    return res.data
}

// Parse xml data to object
async function parseXmlData(data) {
    return await xml2js.parseStringPromise(data)
}

// Abstract nested information from parsed data
// to create required property structure
// properties = [
    // {
    // property_id: <value>,
    // name: <value>,
    // email: <value>
    // },
    // ...
// ]
function extractFromParsedData (data) {
    let properties = data["PhysicalProperty"]["Property"]
    let madisonProperties = []

    for(let i=0; i<properties.length; i++) {
        let propertyData = properties[i]["PropertyID"][0]
        let propertyId = propertyData["Identification"][0]["$"]["IDValue"]
        let propertyName = propertyData["MarketingName"][0]
        let propertyEmail = propertyData["Email"][0]
        let propertyCity = propertyData["Address"][0]["State"][0]
        let propertyUnits = properties[i]["ILS_Unit"]
        let long = properties[i]["ILS_Identification"][0]["Longitude"][0]
        let lat = properties[i]["ILS_Identification"][0]["Latitude"][0]

        let units = []
        for(let i=0; i<propertyUnits.length; i++) {
            let unitBedrooms = {
                unit_id: propertyUnits[i]["Units"][0]["Unit"][0]["Identification"][0]["$"]["IDValue"],
                bedroomNumber: propertyUnits[i]["Units"][0]["Unit"][0]["UnitBedrooms"][0]
            }

            units.push(unitBedrooms)
        }

        if(propertyCity === "MN") {
            let property = {
                property_id: propertyId,
                name: propertyName,
                email: propertyEmail,
                units: units,
                coords: {
                    longitude: long,
                    latitude: lat
                },
                weather: []
            }

            madisonProperties.push(property)
        }
    }

    return madisonProperties
}

module.exports = {
    fetchXmlData,
    parseXmlData,
    extractFromParsedData
}
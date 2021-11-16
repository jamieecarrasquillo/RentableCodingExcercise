const axios = require("axios")
const {docClient} = require("./db")

// Make weather api requests and update property in DynamoDB
async function updateWeatherForProperty(coords, propertyId) {
    const {latitude, longitude} = coords
    let getGridUrl = `https://api.weather.gov/points/${latitude},${longitude}`
    try {
        const response = await axios.get(getGridUrl);
        let getForecastUrl = response.data.properties.forecast
        const weather = await axios.get(getForecastUrl)
        let weatherPeriods = weather.data.properties.periods

        let paramsToUpdate = {
            Key: {
                property_id: propertyId
            },
            TableName: "Properties",
            UpdateExpression: "SET #weather =:w",
            ExpressionAttributeNames: {
                '#weather': 'weather'
            },
            ExpressionAttributeValues:{
                ":w": weatherPeriods
            }
        }

        let update = await docClient.update(paramsToUpdate).promise()
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    updateWeatherForProperty
}
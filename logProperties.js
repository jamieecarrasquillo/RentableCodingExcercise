const {fetchXmlData, parseXmlData, extractFromParsedData} = require("./properties");

// Loggers to visualize incoming property data
async function logProperties() {
    let data = await fetchXmlData()
    let parsedData = await parseXmlData(data)
    let properties = extractFromParsedData(parsedData)

    const args = process.argv.slice(2)

    if (args[0] === 'parsed') {
        console.log(JSON.stringify(parsedData, null, 2))
    } else if(args[0] === 'built') {
        console.log(JSON.stringify(properties, null, 2))
    } else {
        console.log(data)
    }
}

logProperties()

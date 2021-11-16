const Queue = require('bull')
const weatherQueue = new Queue("property weather", 'redis://127.0.0.1:6379')
const {updateWeatherForProperty} = require('./updateWeatherForProperty')

// Process jobs in Redis Queue
weatherQueue.process(async function(job, done) {
    if(job.data.type === "weather update") {
        try {
            await updateWeatherForProperty(job.data.property.Item.coords, job.data.property.Item.property_id)
        } catch(error) {
            console.error(error)
        }
    }
    done()
})


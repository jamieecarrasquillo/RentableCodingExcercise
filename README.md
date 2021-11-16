# Introduction
This is a take home assignment meant to be evaluated by Rentable.

# How To Run
Before running the assignment, you must install Docker, 
and run the following containers in their own terminal instance:

### Run DynamoDB
1. Pull the image `docker pull amazon/dynamodb-local`
2. Run the container on port `docker run --rm -ti -p 8000:8000 amazon/dynamodb-local`

### Run Redis
1. Pull the image `docker pull redis`
2. Start a Redis instance `docker run --rm -ti -p 6379:6379 redis`

### Run Assignment
1) Install all dependencies `npm install`
2) Run server `node server.js`
3) Run worker `node worker.js`

# Documentation

### Architecture
DynamoDB - Store property data

Redis - Queue jobs for worker to process

Worker - Process jobs which update property weather data

Server - Fetch and parse property data, store in DynamoDB, and
expose endpoints for accessing the same

### Endpoints

When the server starts, it fetches the property data and loads it into
a local dynamoDB instance, and then it exposes the following endpoints.

```
GET /api/properties - get all properties 
GET /api/properties/:id - get single property
POST /api/properties/:id/weather - schedule a job for fetching property weather data
```


const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

let database
let mongodbUrl = 'mongodb://127.0.0.1:27017'

if(process.env.MONGODB_URL) {
    mongodbUrl = process.env.MONGODB_URL
}

async function connect() {
    console.log(mongodbUrl)
    const client = await MongoClient.connect(mongodbUrl)
    database = client.db('moshop')
}

function getDb() {
    if(!database) {
        throw { message: 'You must first connect to the database!' }
    }

    return database
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb
}
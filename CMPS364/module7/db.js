const { MongoClient } = require('mongodb')

let dbConnection 

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect ('mongodb://localhost:27017/library')
        .then((client) => {
            dbConnection = client.db();
            return cb ();
        })
        .catch(err => {
            console.log('Error connecting to MongoDB:', err)
            return cb(err)
        });
    },
    getDb: () => dbConnection
};

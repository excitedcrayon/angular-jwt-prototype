const mongoose = require('mongoose');
const DB_URL = 'mongodb://110.232.113.228:27017';
const DB_NAME = 'user_authentication';
const CONNECTION = `${DB_URL}/${DB_NAME}`;

const DBConnection = () => {
    mongoose.connect(CONNECTION, {
        useNewUrlParser: true
    });

    if(mongoose.connection){
        console.log(`DB Connection: ${CONNECTION} is successful`);
    }
};

module.exports = { DBConnection };
var dbProp = require('./config');

module.exports = {
    getDbURL: function(){
        return('mongodb://localhost:27017/' + dbProp.dbname);
    }
};
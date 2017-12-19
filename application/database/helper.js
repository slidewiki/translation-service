'use strict';

const Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient,
    config = require('../configuration.js').MongoDB,
    co = require('../common');

let async = require('async');

let dbConnection = undefined;
let incrementationSettings = {
    collection: 'counters',
    field: '_id',
    step: 1
};

function uniq(a) { //returns an array of unique values
    var prims = {'boolean':{}, 'number':{}, 'string':{}}, objs = [];

    return a.filter(function(item) {
        if (item){
            var type = typeof item;
            if(type in prims)
                return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
        }else{
            return false;
        }
    });
}

function testDbName(name) {
    return typeof name !== 'undefined' ? name : config.SLIDEWIKIDATABASE;
}

function testConnection(dbname) {
    if (!co.isEmpty(dbConnection)) { //TODO test for alive
        if (dbConnection.s.databaseName === dbname)
            return true;
        else {
            dbConnection.close();
            dbConnection = undefined;
            return false;
        }
    }
    return false;
}

//Uses extra collection for autoincrementation
// Code based on https://github.com/TheRoSS/mongodb-autoincrement
// requires document in collection "counters" like: { "_id" : "slides", "seq" : 1, "field" : "_id" } <- is created if not already existing
function getNextId(db, collectionName, fieldName) {
    const fieldNameCorrected = fieldName || incrementationSettings.field;
    const step = incrementationSettings.step;

    let myPromise = new Promise(function (resolve, reject) {
        return db.collection(incrementationSettings.collection).findAndModify({
            _id: collectionName,
            field: fieldNameCorrected
        },
        null, //no sort
            {
                $inc: {
                    seq: step
                }
            },
            {
                upsert: true, //if there is a problem with _id insert will fail
                new: true //insert returns the updated document
            })
        .then((result) => {
            console.log('getNextId: returned result', result);
            if (result.value && result.value.seq) {
                resolve(result.value.seq);
            } else {
                resolve(result.seq);
            }
        })
        .catch((error) => {
            console.log('getNextId: ERROR', error);
            if (error.code === 11000) {
                //no distinct seq
                reject(error);
            } else {
                reject(error);
            }
        });
    });

    return myPromise;
}

//
// let translator = require('mstranslator');
//
// let client = new translator({
//     // client_id: client_id, // use this for the old token API
//     // client_secret: client_secret // use this for the old token API
//     api_key: '77e543f1cd854a8dae6ba7dd1ce1d1b9' //TODO need a better way to store this...
//
// }, true);

let client = require('./mockup_translation');


let languagesAndNames = [];

module.exports = {
    client: client,
    languagesAndNames: languagesAndNames,

    getLanguagesAndNames: function(callback) {
        if (module.exports.languagesAndNames.length){
            callback(null, module.exports.languagesAndNames);
        }else{
            let result = [];
            client.getLanguagesForTranslate((err, codes) => {
                if (err) {
                    console.log(err);
                }
                let filtered = codes.map((code) => { //removing 'complex' languages
                    if (code.length >2){
                        let splitted = code.split('-')[0];
                        if (splitted.length === 2) return splitted;
                        else return ;
                    }else{
                        return code;
                    }
                });
                let unigue = uniq(filtered); //removing duplicates which appeared after simplifying the languages
                let params = {locale:'en', languageCodes: unigue};
                client.getLanguageNames(params, (err, names) => {
                    async.eachOf(codes, (value, key, cbEach) => {
                        if (unigue[key]){
                            result.push({'name': names[key], 'code': unigue[key]});
                            cbEach();
                        }else{
                            cbEach();
                        }
                    }, (err) => {
                        module.exports.languagesAndNames = result;
                        callback(err, result);
                    });
                });
            });
        }
    },
    createDatabase: function (dbname) {
        dbname = testDbName(dbname);

        let myPromise = new Promise(function (resolve, reject) {
            let db = new Db(dbname, new Server(config.HOST, config.PORT));
            const connection = db.open()
            .then((connection) => {
                connection.collection('test').insertOne({ //insert the first object to know that the database is properly created TODO this is not real test....could fail without your knowledge
                    id: 1,
                    data: {}
                }, (data) => {
                    resolve(connection);
                });
            });
        });

        return myPromise;
    },

    cleanDatabase: function (dbname) {
        dbname = testDbName(dbname);

        return this.connectToDatabase(dbname)
        .then((db) => {
            const DatabaseCleaner = require('database-cleaner');
            const databaseCleaner = new DatabaseCleaner('mongodb');
            return new Promise((resolve) => databaseCleaner.clean(db, resolve));
        }).catch((error) => {
            throw error;
        });
    },

    connectToDatabase: function (dbname) {
        dbname = testDbName(dbname);

        if (testConnection(dbname))
            return Promise.resolve(dbConnection);
        else
        return MongoClient.connect('mongodb://' + config.HOST + ':' + config.PORT + '/' + dbname)
        .then((db) => {
            if (db.s.databaseName !== dbname)
                throw new 'Wrong Database!';
            dbConnection = db;
            return db;
        });

    },

    getNextIncrementationValueForCollection: function (dbconn, collectionName, fieldName) {
        return getNextId(dbconn, collectionName, fieldName);
    }
};

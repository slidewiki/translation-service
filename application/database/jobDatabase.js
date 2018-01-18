/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    Microservices = require('../configs/microservices');
    /*
    Controller for handling mongodb and the data model deck while providing CRUD'ish.
    */
let http = require('http');
let translator = require('mstranslator');
let async = require('async');

let self = module.exports = {


    getJobByNewId: (newId) => {

        return helper.connectToDatabase()
            .then((dbconn) => dbconn.collection('jobs'))
            .then((collection) => collection.findOne({
                'data.newId': parseInt(newId)
            }));
    },

};

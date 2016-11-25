/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    slideModel = require('../models/slide.js'),
    Microservices = require('../configs/microservices');

function translate(original, target){
    let translated = original;
    translated.language = target;
    return translated;
}

module.exports = {
    translate: function(id, target){
        let http = require('http');

        let myPromise = new Promise((resolve, reject) => {
            let options = {
                host: Microservices.deck.uri,
                port: Microservices.deck.port,
                path: '/slide/'+id,
                method: 'GET',
                headers : {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            };
            let req = http.request(options, (res) => {
                // console.log('STATUS: ' + res.statusCode);
                // console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                //console.log(res.data);
                res.on('data', (chunk) => {
                    let original = JSON.parse(chunk);

                    if (original.error){
                        //console.log(original);
                        resolve({});
                    }else{
                        if (original.revisions.length > 1){ //there was no revision specified, translate the active revision
                            original.revisions = [original.revisions[original.active-1]];
                        }
                        resolve(translate(original,target));
                    }
                });
            });
            req.on('error', (e) => {
                console.log('problem with request slides: ' + e.message);
                reject(e);
            });
            //req.write(data);
            req.end();
        });
        return myPromise;



        //let he = require('he');

        //let encodedContent = he.encode(slideContent, {allowUnsafeSymbols: true});

        // let jsonData = {
        //     userID: String(user),
        //     html: encodedContent,
        //     filename: slideId
        // };
        //
        // let data = JSON.stringify(jsonData);


        // return helper.connectToDatabase()
        // .then((db) => db.collection('slides'))
        // .then((col) => findOneAndTranslate(col, {
        //     _id: parseInt(id)
        // }, target)
        // .then((col) => col.findOne({
        //     _id: parseInt(id)
        // })
        // );
    },
    get: function (identifier) {
        return helper.connectToDatabase()
        .then((db) => db.collection('slides'))
        .then((col) => col.findOne({
            _id: identifier
        }));
    },

    insert: function (slide) {
        //TODO check for root and parent deck ids to be existent, otherwise create these
        return helper.connectToDatabase()
        .then((db) => helper.getNextIncrementationValueForCollection(db, 'slides'))
        .then((newId) => {
            // console.log('newId', newId);
            return helper.connectToDatabase() //db connection have to be accessed again in order to work with more than one collection
            .then((db2) => db2.collection('slides'))
            .then((col) => {
                let valid = false;
                slide._id = newId;
                try {
                    valid = slideModel(slide);
                    // console.log('validated slidemodel', valid);
                    if (!valid) {
                        return slideModel.errors;
                    }
                    return col.insertOne(slide);
                } catch (e) {
                    console.log('validation failed', e);
                }
                return;
            }); //id is created and concatinated automatically
        });
    },

    replace: function (id, slide) {
        return helper.connectToDatabase()
        .then((db) => db.collection('slides'))
        .then((col) => {
            let valid = false;
            try {
                valid = slideModel(slide);
                if (!valid) {
                    return slideModel.errors;
                }
                return col.findOneAndReplace({
                    _id: id
                }, slide);
            } catch (e) {
                console.log('validation failed', e);
            }
            return;
        });
    }
};

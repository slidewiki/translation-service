'use strict';

const helper = require('./helper'),
    //
    slideModel = require('../models/slide.js'),
    //request = require('request'),
    ///wsClient = require('websocket').client,
    Microservices = require('../configs/microservices');

let http = require('http');
let translator = require('mstranslator');
let async = require('async');

let jobDB = require('./jobDatabase');

// const client_id = 'slidewiki';
// const client_secret = '3irwtY/+pq0e7+SXbldxU0vwMzH2NLfuIJ9eoOxSyjo=';


// let client = new translator({
//     // client_id: client_id, // use this for the old token API
//     // client_secret: client_secret // use this for the old token API
//     api_key: '77e543f1cd854a8dae6ba7dd1ce1d1b9' //TODO need a better way to store this...
//
// }, true);

let client = require('./mockup_translation');

function check_language_code(code, callback) {
    helper.getLanguagesAndNames((err, languages) => {
        if (err) callback(err);
        let result = languages.map((a) => {return a.code;});
        callback(null, result.includes(code));
    });
};

function translateLine(line, source, target, callback){
    let params = {
        text: line,
        from: source,
        to: target,
        contentType: 'text/html'
    };
    client.translate(params, (err, data) => {
        callback(err, data);
    });
}

function filterTags(content){

}

function addTagsBack(content, replace_array){

}

function handle_translation(original, target, user_id, jobId = null){
    let translated = original;
    const sourceRevision = original.revisions[0];

    delete translated.revisions[0].mysql_id;
    translated.origin = {
        id: original._id,
        revision: sourceRevision._id,
        title: sourceRevision.title,
        user: sourceRevision.user,
        kind: 'translation'
    };
    translated.revisions[0]._id = 1;
    translated.revisions[0].id = 1;
    delete translated.revisions[0].parent;
    translated.user = parseInt(user_id);
    translated.revisions[0].user = parseInt(user_id);

    //let source = sourceRevision.language.substring(0,2);

    let source = '';
    if (sourceRevision.language) {
        source = sourceRevision.language.substring(0,2);
    }else if (original.language){
        source = original.language.substring(0,2);
    }else{
        source = 'en';
    }

    let target_code = target.substring(0,2);
    let myPromise = new Promise((resolve, reject) => {
        async.series([
            (cb) => {
                check_language_code(source, (err, result) => {
                    if (err) cb(err);
                    if (!result) {
                        source = 'en';
                        cb();
                    }else{
                        cb();
                    }
                });
            },
            (cb) => {
                check_language_code(target_code, (err, result) => {
                    if (err) cb(err);
                    if (!result) {
                        target_code = 'en';
                        target = 'en_GB';
                        cb();
                    }else{
                        cb();
                    }
                });
            },
            (cbAsync) => {
                console.log('Translating slide ' + original._id + ':' + source + '->' + target_code);
                translateLine(translated.revisions[0].title, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        translated.revisions[0].title = new_line;
                        cbAsync();
                    }
                });
            },
            (cbAsync) => {
                translateLine(translated.revisions[0].content, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        //translated.revisions[0].content = addTagsBack(new_line, replace_array);
                        translated.revisions[0].content = new_line;
                        cbAsync();
                    }
                });
            },

        ], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                translated.language = target;
                translated.revisions[0].language = target;
                if (jobId){
                    jobDB.incProgressToJob(jobId).then((err, res) => {
                        if (err) {
                            console.log(err);
                        }else{
                            resolve (translated);
                        }

                    }).catch((err) => {console.log(err);});
                }else{
                    resolve (translated);
                }

            }
        });
    });
    return myPromise;



}

module.exports = {
    translate: function(id, target, user_id, jobId){

        let rp = require('request-promise-native');
        let myPromise = new Promise((resolve, reject) => {

            var options = {
                uri: Microservices.deck.uri+'/slide/'+id,
                headers : {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                json: true
            };
            rp(options).then(function (original){
                if (original.error){
                    //console.log(original);
                    resolve({});
                }else{
                    if (original.revisions.length > 1){ //there was no revision specified, translate the last revision
                        original.revisions = [original.revisions[original.revisions.length-1]];
                    }
                    resolve(handle_translation(original,target,user_id, jobId));
                }
            })
            .catch(function (e){
                console.log('problem with request slide: ' + e.message);
                reject(e);
            });
        });
        return myPromise;

    },
    // get: function (identifier) {
    //     return helper.connectToDatabase()
    //     .then((db) => db.collection('slides'))
    //     .then((col) => col.findOne({
    //         _id: identifier
    //     }));
    // },
    //
    // insert: function (slide) {
    //     //TODO check for root and parent deck ids to be existent, otherwise create these
    //     return helper.connectToDatabase()
    //     .then((db) => helper.getNextIncrementationValueForCollection(db, 'slides'))
    //     .then((newId) => {
    //         // console.log('newId', newId);
    //         return helper.connectToDatabase() //db connection have to be accessed again in order to work with more than one collection
    //         .then((db2) => db2.collection('slides'))
    //         .then((col) => {
    //             let valid = false;
    //             slide._id = newId;
    //             try {
    //                 valid = slideModel(slide);
    //                 // console.log('validated slidemodel', valid);
    //                 if (!valid) {
    //                     return slideModel.errors;
    //                 }
    //                 return col.insertOne(slide);
    //             } catch (e) {
    //                 console.log('validation failed', e);
    //             }
    //             return;
    //         }); //id is created and concatinated automatically
    //     });
    // },
    //
    // replace: function (id, slide) {
    //     return helper.connectToDatabase()
    //     .then((db) => db.collection('slides'))
    //     .then((col) => {
    //         let valid = false;
    //         try {
    //             valid = slideModel(slide);
    //             if (!valid) {
    //                 return slideModel.errors;
    //             }
    //             return col.findOneAndReplace({
    //                 _id: id
    //             }, slide);
    //         } catch (e) {
    //             console.log('validation failed', e);
    //         }
    //         return;
    //     });
    // }
};

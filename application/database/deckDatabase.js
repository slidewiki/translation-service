/*
Controller for handling mongodb and the data model slide while providing CRUD'ish.
*/

'use strict';

const helper = require('./helper'),
    deckModel = require('../models/deck.js'),
    Microservices = require('../configs/microservices');
    /*
    Controller for handling mongodb and the data model deck while providing CRUD'ish.
    */
let http = require('http');
let translator = require('mstranslator');
let async = require('async');


let client = new translator({
    // client_id: client_id, // use this for the old token API
    // client_secret: client_secret // use this for the old token API
    api_key: '77e543f1cd854a8dae6ba7dd1ce1d1b9' //TODO need a better way to store this...

}, true);

function translateLine(line, source, target, callback){
    let params = {
        text: line,
        from: source,
        to: target
    };
    client.translate(params, (err, data) => {
        callback(err, data);
    });
}

function filterTags(content){

}

function addTagsBack(content, replace_array){

}

function handle_translation(original, target, user_id){
    let translated = original;
    let sourceRevision = original.revisions[0];

    //let source = original.revisions[0].language.substring(0,2);

    let source = '';
    if (sourceRevision.language) {
        source = sourceRevision.language.substring(0,2);
    }else{
        source = original.language.substring(0,2);
    }


    translated.user = parseInt(user_id);
    translated.revisions[0].user = parseInt(user_id);
    //translated.revisions[0].language = target;
    translated.language = target;
    let target_code = target.substring(0,2);

    let myPromise = new Promise((resolve, reject) => {
        async.series([
            (cbAsync) => {
                translateLine(translated.revisions[0].title, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        translated.revisions[0].title = new_line;
                        cbAsync();
                    }
                });
            },
            (cbAsync) => {
                //let replace_array = array();
                //let content = original.revisions[0].content;
                //replace_array = filterTags(content);
                translateLine(original.description, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        //translated.revisions[0].content = addTagsBack(new_line, replace_array);
                        translated.description = new_line;
                        cbAsync();
                    }
                });
            }
        ], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve (translated);
            }
        });

    });
    return myPromise;
}

module.exports = {
    translate: function(id, target, user_id){

        let rp = require('request-promise-native');
        let myPromise = new Promise((resolve, reject) => {

            var options = {
                uri: Microservices.deck.uri+'/deck/'+id,
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
                    console.log(original.revisions);
                    if (original.revisions.length > 1){ //there was no revision specified, translate the last revision
                        original.revisions = [original.revisions[original.revisions.length-1]];
                    }
                    resolve(handle_translation(original,target,user_id));
                }
            })
            .catch(function (e){
                console.log('problem with request deck: ' + e.message);
                reject(e);
            });
        });
        return myPromise;

    },
};

'use strict';

const async = require('async');
const translationImpl = require('../services/mstranslator');
const deckService = require('../services/deck');

function handle_translation(original, target, user_id, jobId = null){
    let translated = original;
    let sourceRevision = original.revisions[0];

    //let source = original.revisions[0].language.substring(0,2);

    let source = '';
    if (sourceRevision.language) {
        source = sourceRevision.language.substring(0,2);
    }else if (original.language){
        source = original.language.substring(0,2);
    }else{
        source = 'en';
    }


    translated.user = parseInt(user_id);
    translated.revisions[0].user = parseInt(user_id);
    //translated.revisions[0].language = target;
    translated.language = target;
    let target_code = target.substring(0,2);

    let myPromise = new Promise((resolve, reject) => {
        async.series([
            (cbAsync) => {
                translationImpl.translateLine(translated.revisions[0].title, source, target_code, (err, new_line) => {
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
                translationImpl.translateLine(original.description, source, target_code, (err, new_line) => {
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
                if (jobId){
                    console.log('deckDatabase.js jobId: ' + jobId);
                }
                resolve (translated);
            }
        });

    });
    return myPromise;
}

module.exports = {

    translate: function(id, target, user_id){
        return deckService.fetchContentItem('deck', id).then((original) => {
            if (original.error){
                //console.log(original);
                return {};
            }else{
                if (original.revisions.length > 1){ //there was no revision specified, translate the last revision
                    original.revisions = [original.revisions[original.revisions.length-1]];
                }
                return handle_translation(original,target,user_id);
            }
        });
    },

};

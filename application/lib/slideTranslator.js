'use strict';

const async = require('async');
const translationImpl = require('../services/mstranslator');
const deckService = require('../services/deck');

function handle_translation(original, target, user_id){
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
                translationImpl.check_language_code(source, (err, result) => {
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
                translationImpl.check_language_code(target_code, (err, result) => {
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
                translationImpl.translateLine(translated.revisions[0].title, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        translated.revisions[0].title = new_line;
                        cbAsync();
                    }
                });
            },
            (cbAsync) => {
                translationImpl.translateLine(translated.revisions[0].content, source, target_code, (err, new_line) => {
                    if (err) cbAsync(err);
                    else {
                        //translated.revisions[0].content = addTagsBack(new_line, replace_array);
                        translated.revisions[0].content = new_line;
                        cbAsync();
                    }
                }, true);
            },

        ], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                translated.language = target;
                translated.revisions[0].language = target;
                resolve (translated);
            }
        });
    });
    return myPromise;



}

module.exports = {

    translate: function(id, target, user_id){
        return deckService.fetchContentItem('slide', id).then((original) => {
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

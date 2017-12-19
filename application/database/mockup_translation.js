'use strict';


let self = module.exports = {

    translate: (params, callback) => {
        let result = 'Lorem Ipsum';
        callback(null, result);
    },

    getLanguagesForTranslate: (callback) => {
        let result = ['ru', 'nl', 'de', 'es', 'ar', 'en', 'it', 'fr', 'sr', 'ca', 'el'];
        callback(null, result);
    },

    getLanguageNames: (params, callback) => {
        let result = ['Russian', 'Dutch', 'German', 'Spanish', 'Arabic', 'English', 'Italian', 'French', 'Serbian', 'Catalan', 'Greek'];

        callback(null, result);
    }
};

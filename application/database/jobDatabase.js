'use strict';

const helper = require('./helper');

module.exports = {

    getJobByNewId: (newId) => {

        return helper.connectToDatabase()
            .then((dbconn) => dbconn.collection('jobs'))
            .then((collection) => collection.findOne({
                'data.newId': parseInt(newId)
            }));
    },

    incProgressToJob: (newId_fromJob) => {

        return new Promise((resolve, reject) => {
            return helper.connectToDatabase() //db connection have to be accessed again in order to work with more than one collection
            .then((db) => db.collection('jobs'))
            .then((col) => {
                return col.findOne({'data.newId': parseInt(newId_fromJob)})
                .then((found) => {
                    console.log('updateProgress for job: ' + JSON.stringify(found));
                    if (found){
                        if (found.progress){
                            found.progress++;
                            col.save(found);
                            console.log(found.progress);
                            resolve(null, true);
                        }else{
                            found.progress = 1;
                            col.save(found);
                            console.log(found.progress);
                            resolve(null, true);
                        }
                    }else{
                        console.log('Job not found: ' + newId_fromJob);
                        reject('Job not found: ' + newId_fromJob, false);
                    }
                })
                .catch( (err) => {
                    console.log(err);
                    reject(err);
                });
            });
        });
    }

};

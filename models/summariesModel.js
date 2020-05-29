 const uuid = require('uuid');
 const mongoose = require('mongoose');

 const summarySchema = mongoose.Schema({
     id: {
         type: String,
         required: true,
         unique: true
     },
     summaryCreator: {
        type: String,
        required: true
     },
     summaryName: {
         type: String,
         required: true
     },
     summarySource: {
         type: String,
         required: true
     },
     summaryTags: {
         type: Array,
         required: true
     },
     share: {
         type: Array,
         required: true
     },
     summary: {
         type: String,
         required: true
     },
     date: {
         type: Date,
         required: true
     }
 })

 const summariesCollection = mongoose.model('summaries', summarySchema);


 const summaries = {
    getSummaries: function() {
         return summariesCollection
             .find()
             .then(allSummaries => {
                 return allSummaries;
             })
             .catch(err => {
                 return err;
             });
    },
    getSummary: function(summaryId) {
         return summariesCollection
             .find(summaryId)
             .then(foundSummary => {
                 return foundSummary;
             })
             .catch(err => {
                 return err;
             });
    },
    getSummarybyCreator: function(creatorId) {
        return summariesCollection
            .find(creatorId)
            .then(foundSummary => {
                return foundSummary;
            })
            .catch(err => {
                return err;
            });
    },
    getTwoSummaries: function(userName1, userName2 ) {
        return summariesCollection
            .find({summaryCreator : userName1})
            .then(firstSummary => {
                return summariesCollection
                    .find({summaryCreator : userName2})
                    .then(secondSummary => {
                        let array = firstSummary.concat(secondSummary);
                        return array;
                    })
                    .catch(err => {
                        return err;
                    });
            })
            .catch(err => {
                return err;
            });
    },
    getSummaryFeed: function(userName) {
        return summariesCollection
            .find({share: { $all : [userName] } } )
            .then(friendFeed => {
                return summariesCollection
                    .find({share: { $all : ["public"] } })
                    .then(publicFeed => {
                        return summariesCollection
                            .find({$or: [{summaryCreator : userName, share: ["private"]}, {summaryCreator : userName, share: ["friends"]} ]  } )
                            .then(privateFeed => {
                                console.log(privateFeed);
                                let array = friendFeed.concat(publicFeed);
                                array = array.concat(privateFeed);
                                return array;
                            })
                            .catch(err => {
                                return err;
                            });
                    })
                    .catch(err => {
                        return err;
                    });
            })
            .catch(err => {
                return err;
            });
    },
    getSummaryPublic: function() {
        return summariesCollection
            .find({share: { $all : ["public"] } } )
            .then(foundSummary => {
                return foundSummary;
            })
            .catch(err => {
                return err;
            });
    },
    createSummary: function(summaryInfo) {
         return summariesCollection
             .create(summaryInfo)
             .then(createdSummary => {
                 return createdSummary;
             })
             .catch(err => {
                 return err;
             });
    },
    deleteSummary: function(summaryId) {
         return summariesCollection
             .deleteOne(summaryId)
             .then(deletedSummary => {
                 return deletedSummary;
             })
             .catch(err => {
                 return err;
             });
    },
    updateSummary: function(summaryId, summaryChanges) {
         return summariesCollection
             .updateOne(summaryId, summaryChanges)
             .then(updatedSummary => {
                 return updatedSummary;
             })
             .catch(err => {
                 return err;
             });
    }
 }

 module.exports = { summaries };
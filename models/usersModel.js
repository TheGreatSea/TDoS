const uuid = require('uuid');
const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    userPassword: {
        type: String,
        required: true
    },
    friendList: {
        type: Array,
        required: true
    },
    summaryList: {
        type: Array,
        required: true
    }
})

const usersCollection = mongoose.model('users', usersSchema);

const users = {
    getUsers: function() {
        return usersCollection
            .find()
            .then(allUsers => {
                return allUsers;
            })
            .catch(err => {
                return err;
            });
    },
    getUser: function(userName) {
        return usersCollection
            .find(userName)
            .then(foundUser => {
                return foundUser;
            })
            .catch(err => {
                return err;
            });
    },
    createUser: function(userInfo) {
        return usersCollection
            .create(userInfo)
            .then(createdUser => {
                return createdUser;
            })
            .catch(err => {
                return err;
            });
    },
    deleteUser: function(userId) {
        return usersCollection
            .deleteOne(userId)
            .then(deletedUser => {
                return deletedUser;
            })
            .catch(err => {
                return err;
            });
    },
    updateUser: function(userName, userChanges) {
        return usersCollection
            .updateOne(userName, userChanges)
            .then(updatedUser => {
                return updatedUser;
            })
            .catch(err => {
                return err;
            });
    }
}

module.exports = { users };
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const uuid = require('uuid');
const morgan = require('morgan');
const authorization = require('./middleware/authorization');
const app = express();

//const cors = require('./middleware/cors');
const { DATABASE_URL, PORT, SECRET_TOKEN } = require('./config');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const mongoose = require('mongoose')
const { users } = require('./models/usersModel')
const { summaries } = require('./models/summariesModel')

//app.use(cors);

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(authorization);

//////////////////////////////////////////////////////////////
//User Obtain data
//////////////////////////////////////////////////////////////

app.get('/users', (req, res) => {
    users
        .getUsers()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/user', (req, res) => {
    let userName = req.query.userName;
    if (!userName) {
        res.statusMesagge = "User is required";
        return res.status(406).end();
    }
    users
        .getUser({ userName })
        .then(result => {
            console.log(result.length);
            if (result.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/userbyId', (req, res) => {
    let id = req.query.id;
    if (!id) {
        res.statusMesagge = "Id is required";
        return res.status(406).end();
    }
    users
        .getUser({ id })
        .then(result => {
            console.log(result.length);
            if (result.length === 0) {
                res.statusMesagge = `${Id} not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/twoUsers', (req, res) => {
    let userName = req.query.userName;
    let friendName = req.query.friendName;
    if (!userName || !friendName) {
        res.statusMesagge = "Two users are required";
        return res.status(406).end();
    }
    users
        .getTwoUsers(userName, friendName)
        .then(result => {
            console.log(result.length);
            if (result.length === 0) {
                res.statusMesagge = `Usernames not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//////////////////////////////////////////////////////////////
//User register, validation, changes and delete
//////////////////////////////////////////////////////////////
app.get('/users/validate-token',(req, res) =>{
    const{ sessiontoken} = req.headers;
    jwt.verify(sessiontoken, SECRET_TOKEN, (err, decoded)=>{
        if(err){
            res.statusMessage = "Session expired";
            return res.status(400).end();
        }
        return res.status(200).json(decoded);
    });
});

app.post('/users/login',jsonParser, (req, res) =>{
    console.log("Login user");
    console.log("Body ", req.body);
    let { userName, userPassword } = req.body;
    if (!userName || !userPassword) {
        res.statusMessage = "Missing Fields";
        res.status(406).end();
    }

    users
        .getUser({userName})
        .then( user =>{
            if (user){
                bcrypt.compare( userPassword, user[0].userPassword)
                    .then(result =>{
                        if(result){
                            let userData = {
                                id : user[0].id,
                                userName : user[0].userName,
                                friendList : user[0].friendList
                            };
                            jwt.sign(userData, SECRET_TOKEN, {expiresIn: '20m'}, (err, token)=>{
                                if(err){
                                    res.statusMessage = "Something went wrong in login.";
                                    return res.status(400).end();
                                }
                                return res.status(200).json({token});
                            });
                        }
                        else{
                            throw new Error ("Invalid credentials.");
                        }
                    })
                    .catch(err => {
                        res.statusMessage = err.message;
                        return res.status(400).end();
                    });
            }
            else{
                throw new Error ("User doesn't exist.");
            }
        })
        .catch(err => {
            res.statusMessage = err.message;
            return res.status(400).end();
        });
});

app.post('/users/register', jsonParser, (req, res) => {
    console.log("Adding a new user");
    console.log("Body ", req.body);
    let { userName, userPassword } = req.body;
    if (!userName || !userPassword) {
        res.statusMessage = "Missing Fields";
        res.status(406).end();
    }
    if (userName == "Public" || userName == "Private"){
        res.statusMessage = "Reserved usernames";
        res.status(406).end();
    }
    let friendList = 0
    let summaryList = 0
    bcrypt.hash(userPassword, 10)
        .then(hashedPassword => {
            let newUser = {
                id: uuid.v4(),
                userName: userName,
                userPassword: hashedPassword,
                friendList: friendList,
                summaryList: summaryList
            }
            users
                .createUser(newUser)
                .then(result => {
                    if (result.errmsg) {
                        res.statusMessage = "The user name already exists. Try other.";
                        return res.status(409).end();
                    }
                    return res.status(201).json(result);
                })
                .catch(err => {
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.post('/users/changePassword',jsonParser, (req, res) =>{
    console.log("Changing password");
    console.log("Body ", req.body);
    let { userName, newPassword } = req.body;
    if (!userName || !newPassword ) {
        res.statusMessage = "Missing Fields";
        res.status(406).end();
    }
    users
        .getUser({userName})
        .then( user =>{
            if (user){
                bcrypt.hash(userPassword, 10)
                    .then(hashedPassword => {
                        let updateUser = {
                            userName: userName,
                            userPassword: hashedPassword
                        }
                        users
                            .updateUser({ userName: userName }, updateUser)
                            .then(result => {
                                if (result.errmsg) {
                                    res.statusMessage = "Error changing the password";
                                    return res.status(409).end();
                                }
                                return res.status(201).json(result);
                            })
                            .catch(err => {
                                res.statusMessage = "Error with the database";
                                return res.status(500).end();
                            });
                    })
                    .catch(err => {
                        res.statusMessage = "Error with the database";
                        return res.status(500).end();
                    });
            }
            else{
                throw new Error ("User doesn't exist");
            }
        })
        .catch(err => {
            res.statusMessage = err.message;
            return res.status(400).end();
        });
});

app.delete('/users/:userName', (req, res) => {
    let UserName = req.params.userName;
    console.log(UserName)
    if (!UserName) {
        res.statusMessage = "Missing UserName";
        return res.status(406).end();
    }
    users
        .deleteUser({ UserName })
        .then(result => {
            if (result.deletedCount === 0) {
                res.statusMessage = "The user was not found. Critical Error";
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//////////////////////////////////////////////////////////////
//Operations for friend managment and summary managment
//////////////////////////////////////////////////////////////

//Get all not friends of user
app.get('/notFriends', (req, res) => {
    let userName = req.query.userName;
    if (!userName) {
        res.statusMesagge = "UserName is required";
        return res.status(406).end();
    }
    users
        .getUsers()
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `Error finding friends`;
                return res.status(404).end();
            }
            let notFriends = [];
            for(let i=0; i < result.length; i++){
                let index = result[i].friendList.findIndex(i => i.friendName == userName);
                if(index == -1){
                    if(result[i].userName != userName)
                        notFriends.push(result[i].userName);
                }
            }
            console.log(notFriends);
            return res.status(200).json(notFriends);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});
//Get all pending friends of user
app.get('/pendingFriends', (req, res) => {
    let userName = req.query.userName;
    if (!userName) {
        res.statusMesagge = "UserName is required";
        return res.status(406).end();
    }
    users
        .getUser({userName : userName})
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${userName} pending friends not found`;
                return res.status(404).end();
            }
            let pending = [];
            
            for(let i=0; i < result[0].friendList.length; i++){
                if(result[0].friendList[i].status == 'Pending'){
                    pending.push(result[0].friendList[i]);
                }
            }
            console.log(pending);
            return res.status(200).json(pending);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});
//Get all accepted friends
app.get('/acceptedFriends', (req, res) => {
    let userName = req.query.userName;
    if (!userName) {
        res.statusMesagge = "UserName is required";
        return res.status(406).end();
    }
    users
        .getUser({userName : userName})
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${userName} accepted friends not found`;
                return res.status(404).end();
            }
            let accepted = [];
            for(let i=0; i < result[0].friendList.length; i++){
                if(result[0].friendList[i].status == 'Accepted'){
                    accepted.push(result[0].friendList[i]);
                }
            }
            console.log(accepted);
            return res.status(200).json(accepted);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//Send a friend request
app.post('/userFriend', (req, res) => {
    let userName = req.query.userName;
    let queryfriendName = req.query.friendName;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!queryfriendName) {
        res.statusMesagge = "Missing Id of friend";
        return res.status(406).end();
    }
    users
        .getTwoUsers(userName,queryfriendName)
        .then(result => {
            if (result.length === 0 || result.length === 1) {
                res.statusMesagge = `Users not found`;
                return res.status(404).end();
            }
            result[0].friendList.push(
                {friendName: queryfriendName,
                status: 'Pending',
                sender: userName }
                );
            result[1].friendList.push({
                friendName: userName,
                status: 'Pending',
                sender: userName });
            return users
                .updateTwoUsers({ userName: userName }, result[0],{ userName: queryfriendName }, result[1] )
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    console.log("This is the child error");
                    res.statusMessage = "Error with the database. Could not add friend.";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            console.log("This is the parent error")
            res.statusMessage = "Error with the database. Could not add friend.";
            return res.status(500).end();
        });
});

// Accept a friend
app.patch('/userFriend', (req, res) => {
    let userName = req.query.userName;
    let queryfriendName = req.query.friendName;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!queryfriendName) {
        res.statusMesagge = "Missing Id of friend";
        return res.status(406).end();
    }
    users
        .getTwoUsers(userName,queryfriendName)
        .then(result => {
            if (result.length === 0 || result.length === 1) {
                res.statusMesagge = `Users not found`;
                return res.status(404).end();
            }
            let index1 = result[0].friendList.findIndex(i => i.friendName == queryfriendName);
            let index2 = result[1].friendList.findIndex(i => i.friendName == userName);
            console.log(index1, index2);
            
            if (index1 == -1 || index2 == -1){
                res.statusMessage = "Failed to find friends";
                return res.status(404).end();
            }else{
                result[0].friendList[index1] = {friendName: queryfriendName, status: 'Accepted'};
                result[1].friendList[index2] = {friendName: userName, status: 'Accepted'};
            }
            return users
                .updateTwoUsers({ userName: userName }, result[0],{ userName: queryfriendName }, result[1] )
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    console.log("This is the child error");
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            console.log("This is the parent error")
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//Share summaries with new friend
app.patch('/shareToFriend', (req, res) => {
    let userName = req.query.userName;
    let queryfriendName = req.query.friendName;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!queryfriendName) {
        res.statusMesagge = "Missing Id of friend";
        return res.status(406).end();
    }
    summaries
        .getTwoSummaries(userName, queryfriendName)
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `Summaries not found`;
                return res.status(404).end();
            }
            for(let i = 0; i < result.length ; i++){
                if (result[i].share[0] == "friends"){
                    if(result[i].summaryCreator ==  userName){
                        result[i].share.push(String(queryfriendName));
                    }
                    else if(result[i].summaryCreator ==  queryfriendName){
                        result[i].share.push(String(userName));
                    }
                    summaries
                        .updateSummary({id : result[i].id},result[i])
                            .then(result => {
                                console.log(result);
                            })
                            .catch(err => {
                                res.statusMessage = "Error with the database";
                                return res.status(500).end();
                            });      
                }
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database" + err.message;
            return res.status(500).end();
        });
});

//Delete a friend
app.delete('/userFriend', (req, res) => {
    let userName = req.query.userName;
    let queryfriendName = req.query.friendName;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!queryfriendName) {
        res.statusMesagge = "Missing name of friend";
        return res.status(406).end();
    }
    users
        .getTwoUsers(userName,queryfriendName)
        .then(result => {
            if (result.length === 0 || result.length === 1) {
                res.statusMesagge = `Users not found`;
                return res.status(404).end();
            }
            let index1 = result[0].friendList.findIndex(i => i.friendName == queryfriendName);
            let index2 = result[1].friendList.findIndex(i => i.friendName == userName);
            console.log(index1, index2);
            
            if (index1 == -1 || index2 == -1){
                res.statusMessage = "Failed to find friends";
                return res.status(404).end();
            }else{
                result[0].friendList.splice(index1,1);
                result[1].friendList.splice(index2,1);
            }
            return users
                .updateTwoUsers({ userName: userName }, result[0],{ userName: queryfriendName }, result[1] )
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    console.log("This is the child error");
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            console.log("This is the parent error")
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//Add summary
app.post('/userSummary', (req, res) => {
    let userName = req.query.userName;
    let querySummary = req.query.summaryId;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!querySummary) {
        res.statusMesagge = "Missing Id of summary";
        return res.status(406).end();
    }
    users
        .getUser({ userName })
        .then(mainUser => {
            if (mainUser.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            console.log(mainUser[0]);
            mainUser[0].summaryList.push(querySummary);
            return users
                .updateUser({ userName: userName }, mainUser[0])
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            console.log("This is the parent error")
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//Delete a summary from a user
app.delete('/userSummary', (req, res) => {
    let userName = req.query.userName;
    let querySummary = req.query.summaryId;
    if (!userName) {
        res.statusMesagge = "Missing user field";
        return res.status(406).end();
    }
    if (!querySummary) {
        res.statusMesagge = "Missing Id of summary";
        return res.status(406).end();
    }
    users
        .getUser({ userName })
        .then(mainUser => {
            if (mainUser.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            console.log(mainUser[0]);
            let index = mainUser[0].summaryList.find(querySummary);
            if (index == -1) {
                res.statusMessage = "Summary not found";
                return res.status(404).end();
            } else {
                mainUser.summaryList.splice(index, 1);
            }
            return users
                .updateUser({ userName: userName }, mainUser[0])
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
        })
        .catch(err => {
            console.log("This is the parent error")
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/*                         Summaries                         */
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

app.get('/summaries', (req, res) => {
    summaries
        .getSummaries()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/summaryById', (req, res) => {
    let summaryId = req.query.summaryId;
    if (!summaryId) {
        res.statusMesagge = "SummaryId is required";
        return res.status(406).end();
    }
    summaries
        .getSummary({ id : summaryId })
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${summaryId} not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/summaryByCreator', (req, res) => {
    let creatorId = req.query.creatorId;
    if (!creatorId) {
        res.statusMesagge = "CreatorId is required";
        return res.status(406).end();
    }
    summaries
        .getSummarybyCreator(creatorId)
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${creatorId} summaries not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/summaryFeed', (req, res) => {
    let userName = req.query.userName;
    if (!userName) {
        res.statusMesagge = "userName is required";
        return res.status(406).end();
    }
    summaries
        .getSummaryFeed(userName)
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${userName} feed not found`;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.get('/summaryPublic', (req, res) => {
    summaries
        .getSummaryPublic()
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `Public feed not found`;
                console.log("Public feed not found");
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.post('/summary', jsonParser, (req, res) => {
    console.log("Adding a new summary");
    console.log("Body ", req.body);
    let {summaryCreator, summaryName, summarySource, summaryTags, share, summary } = req.body;
    if (!summaryName || !summarySource || !summaryTags || !summary || !summaryCreator || !share) {
        res.statusMessage = "Missing Fields";
        res.status(406).end();
    }
    let newSummary = {
        id: uuid.v4(),
        summaryCreator: summaryCreator,
        summaryName: summaryName,
        summarySource: summarySource,
        summaryTags: summaryTags,
        share: share,
        summary: summary,
        date: Date.now()
    }
    summaries
        .createSummary(newSummary)
        .then(result => {
            if (result.errmsg) {
                res.statusMessage = "Error creating the summary";
                return res.status(409).end();
            }
            return res.status(201).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.delete('/summaries/:summaryId', (req, res) => {
    let summaryId = req.params.summaryId;
    console.log(summaryId)
    if (!summaryId) {
        res.statusMessage = "Missing summaryId";
        return res.status(406).end();
    }
    summaries
        .deleteSummary({ summaryId })
        .then(result => {
            if (result.deletedCount === 0) {
                res.statusMessage = "The summary was not found. Critical Error";
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

app.patch('/users/:summaryId', jsonParser, (req, res) => {
    console.log(req.body);
    let { id, summaryCreator, summaryName, summarySource, summaryTags, share, summary  } = req.body;
    let paramsId = req.params.summaryId;
    if (!paramsId) {
        res.statusMessage = "SummaryId was not sent in request";
        return res.status(406).end();
    }
    if (id !== paramsId) {
        res.statusMessage = "The ids do not match";
        return res.status(409).end();
    }
    let data = {
        id: String(id),
        summaryCreator : String(summaryCreator),
        summaryName: String(summaryName),
        summarySource: String(summarySource),
        summaryTags: summaryTags,
        share: share,
        summary: String(summary),
        date: Date.now()
    }
    console.log(data);

    summaries
        .updateUser({ id: id }, data)
        .then(result => {
            return res.status(202).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/*                         Sever start                       */
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
app.listen(PORT, () => {
    console.log("This server is running on port 27017");
    new Promise((resolve, reject) => {
            const settings = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            };
            mongoose.connect(DATABASE_URL, settings, (err) => {
                if (err) {
                    return reject(err);
                } else {
                    console.log("Database connected successfully.");
                    return resolve();
                }
            })
        })
        .catch(err => {
            console.log(err);
        })
});
// Base URL : http://localhost:27017/
// GET endpoint : http://localhost:27017/bookmarks
// GET endpoint : http://localhost:27017/bookmark?title=value
// POST endpoint : http://localhost:27017/bookmarks
// DELETE endpoint : http://localhost:27017/bookmark/id 
// PATCH endpoint: http://localhost:27017/bookmark/id
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

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
/*                         Users                             */
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

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
                                userName : user[0].userName
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

app.patch('/users/:userName', jsonParser, (req, res) => {
    console.log(req.body);
    let { userName, userPassword } = req.body;
    let paramsUN = req.params.userName;
    if (!userName) {
        res.statusMessage = "UserName was not sent in request";
        return res.status(406).end();
    }
    if (userName !== paramsUN) {
        res.statusMessage = "The userNames do not match";
        return res.status(409).end();
    }
    let user = {
        userName: String(userName),
        userPassword: String(userPassword)
    }
    console.log(user);

    users
        .updateUser({ userName: userName }, user)
        .then(result => {
            res.statusMessage = "The user information was changed succesfully";
            return res.status(202).json(result);
        })
        .catch(err => {
            res.statusMessage = "Error with the database";
            return res.status(500).end();
        });
});

//Add friend
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
    let friendObj = {
        friendName: queryfriendName,
        status: 'Pending'
    };
    users
        .getUser({userName})
        .then(mainUser => {
            if (mainUser.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            mainUser[0].friendList.push(friendObj);
            console.log(mainUser[0]);
            return users
                .updateUser({ userName: userName }, mainUser[0])
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
    let friendObj = {
        friendName: queryfriendName,
        status: 'Accepted'
    };
    users
        .getUser({userName})
        .then(mainUser => {
            if (mainUser.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            let index = mainUser[0].friendList.findIndex(i => i.friendName == queryfriendName);
            if (index == -1){
                res.statusMessage = "Friend not found";
                return res.status(404).end();
            }else{
                mainUser[0].friendList[index] = friendObj;
            }
            console.log(mainUser[0]);
            return users
                .updateUser({ userName: userName }, mainUser[0])
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
//Delete a friend
app.delete('/userFriend', (req, res) => {
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
        .getUser({ userName })
        .then(mainUser => {
            if (mainUser.length === 0) {
                res.statusMesagge = `${userName} not found`;
                return res.status(404).end();
            }
            let index = mainUser[0].friendList.findIndex(i => i.friendName == queryfriendName);
            if (index == -1){
                res.statusMessage = "Friend not found";
                return res.status(404).end();
            }else{
                mainUser[0].friendList.splice(index, 1);
            }
            console.log(mainUser[0]);
            return users
                .updateUser({ userName: userName }, mainUser[0])
                .then(patched => {
                    return res.status(202).json(patched);
                })
                .catch(err => {
                    console.log("This is the child error");
                    res.statusMessage = "Error with the database";
                    return res.status(500).end();
                });
            //return res.status(200).json(mainUser);
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
    let userId = req.query.userId;
    if (!userId) {
        res.statusMesagge = "UserId is required";
        return res.status(406).end();
    }
    summaries
        .getSummaryFeed(userId)
        .then(result => {
            if (result.length === 0) {
                res.statusMesagge = `${userId} feed not found`;
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
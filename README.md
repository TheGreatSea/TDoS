# TDoS

<p>Description of endpoints: </p>

<h2>Generic user obtain data</h2>

<div>GET : /users</div>
<p> Obtains the data of all the users</p>

<div>GET : /user?userName=</div>
<p> Obtains the data given an userName</p>

<div>GET : /userbyId?id=</div>
<p> Obtains the data given an id of an user</p>

<div>GET : /twoUsers?userName=&friendName</div>
<p> Obtains the data of two specific users</p>

<h2>For user register, validation and changes</h2>

<div>GET : /users/validate-token</div>
<p> A session token in the headers is neeeded. Validates a session token.</p>

<div>POST: /users/login</div>
<p> Needs a body with the userName and the userPassword. Generates a session token if the user exists.</p>

<div>POST: /users/register</div>
<p> Needs a body with the userName and the userPassword. Registers an user</p>

<div>POST: /users/changePassword</div>
<p> Needs a body with the userName and the userPassword. Changes the password of an user</p>

<h2>Endpoints for friend managment and summaty managment</h2>

<div>GET: /notFriends?userName=</div>
<p> Returns all the users that are not yet friends of the user that has the given userName</p>

<div>GET: /pendingFriends?userName=</div>
<p> Returns all the users that are pending friends of the user that has the given userName</p>

<div>GET: /acceptedFriends?userName=</div>
<p> Returns all the users that are accepted friends of the user that has the given userName</p>

<div>POST: /userFriend?userName=&friendName=</div>
<p>Generates a friend request. Generates friend status of pending</p>

<div>PATCH: /userFriend?userName=&friendName=</div>
<p>Accepts a friend request. Generates friend status of accepted</p>

<div>PATCH: /shareToFriend?userName=&friendName=</div>
<p>Shares summaries between friends</p>

<div>DELETE: /userFriend?userName=&friendName=</div>
<p>Deletes friend and servers any conection to it.</p>

<div>DELETE: /unshareToFriend?userName=&friendName=</div>
<p>Unshares summaries between friends.</p>

<div>POST: /userSummary?userName=&summaryId=</div>
<p>Adds a summaryId to the summaryList of the user</p>

<div>POST: /userSaveSummary?userName=&summaryId=</div>
<p>Saves and creates a  copy of a summary from another user.</p>

<div>DELETE: /userSummary?userName=&summaryId=</div>
<p>Deletes a summaryId to the summaryList of the user.</p>

<h2>Endpoints mainly for summaries collection</h2>

<div>GET : /summaries</div>
<p> Obtains the data of all the summaries</p>

<div>GET : /summaryById?summaryId=</div>
<p> Obtains the summary given an summaryId</p>

<div>GET : /summaryByCreator?creatorId=</div>
<p> Obtains all the summaries of a given user</p>

<div>GET : /summaryFeed?userName=</div>
<p> Obtains the feed of summaries of an users</p>

<div>GET : /summaryPublic</div>
<p> Obtains the feed of summaries that are public</p>

<div>POST : /summary</div>
<p> Needs in the body all information needed in order to generate a summary</p>

<div>DELETE : /summary?summaryId=</div>
<p> Erases a summary</p>

<div>PATCH : /summary?summaryId=</div>
<p> Needs in the body all information needed in order to update a summary</p>



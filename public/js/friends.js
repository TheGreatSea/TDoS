const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';

let userName = "";
let id = "";
let friendList = [];

let users = [];
let friends = [];
let pending = [];


///Shuffle method and pseudocode obtained from : https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function validate(){
    let url = `/users/validate-token`;
    let settings = {
        method : 'GET',
        headers : { 
            sessiontoken : localStorage.getItem('token'),
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            userName = responseJSON.userName;
            id = responseJSON.id;
            friendList = responseJSON.friendList;
            console.log(responseJSON);
            init();
        })
        .catch( err => {
            window.alert("Session expired. Redirecting");
            localStorage.removeItem('token');
            window.location.href = "./user_entry.html";
        });
}

function sendRequest(userName, friendName){
    let url = `/userFriend?userName=${userName}&friendName=${friendName}`;
    let settings = {
        method : 'POST',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Request sent");
            location.reload();
        })
        .catch( err => {
            alert("Error: " + err.message);
        });
}
function confirmRequest(userName, friendName){
    let url = `/userFriend?userName=${userName}&friendName=${friendName}`;
    let settings = {
        method : 'PATCH',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Request accepted");
            shareSummaries(userName, friendName);
            //location.reload();
        })
        .catch( err => {
            alert("Error: " + err.message);
        });
}
function shareSummaries(userName, friendName){
    console.log("Beggining to do this");
    let url = `/shareToFriend?userName=${userName}&friendName=${friendName}`;
    let settings = {
        method : 'PATCH',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Sharing summaries");
            //shareSummaries(userName, friendName);
            location.reload();
        })
        .catch( err => {
            console.log("This is the error");
            alert("Error: " + err.message);
        });
}
function deleteFriend(userName, friendName){
    let url = `/userFriend?userName=${userName}&friendName=${friendName}`;
    let settings = {
        method : 'DELETE',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Friend deleted");
            location.reload();
        })
        .catch( err => {
            alert("Error: " + err.message);
        });
}

function populatePending(pending_Array){
    console.log("Populating pending");
    let section = document.getElementById("secPending");
    if(pending_Array.length != 0){
        document.getElementById("tit_pen").classList.remove("hidden");
        for(let i = 0; i< pending_Array.length;i++){
            if (pending_Array[i].sender == userName){
                section.innerHTML += `
                <div class="containers">
                <table>
                    <tr>
                        <td rowspan="2">${pending_Array[i].friendName}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><button type="button" id="del_${pending_Array[i].friendName}" class="Delete">Delete</button></td>
                    </tr>
                </table>
                </div>
                `;
            }
            else{
                section.innerHTML += `
                <div class="containers">
                <table>
                    <tr>
                        <td rowspan="2">${pending_Array[i].friendName}</td>
                    </tr>
                    <tr>
                        <td><button type="button" id="acc_${pending_Array[i].friendName}" class="Accept">Accept</button></td>
                        <td><button type="button" id="del_${pending_Array[i].friendName}" class="Delete">Delete</button></td>
                    </tr>
                </table>
                </div>
                `;
            }
        }
    }
}

function populateFriends(friends_Array){
    console.log("Populating friends");
    let section = document.getElementById("secFriends");
    shuffleArray(friends_Array);
    if(friends_Array.length != 0){
        document.getElementById("tit_fri").classList.remove("hidden");
        for(let i = 0; i< friends_Array.length;i++){
                section.innerHTML += `
                <div class="containers">
                <table>
                    <tr>
                        <td rowspan="2">${friends_Array[i].friendName}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><button type="button" id="del_${friends_Array[i].friendName}" class="Delete">Delete</button></td>
                    </tr>
                </table>
                </div>
                `;
        }
    }
}

function populateNotFriends(not_Array){
    console.log("Populating not friends");
    let section = document.getElementById("secNotFriends");
    shuffleArray(not_Array);
    if(not_Array.length != 0){
        document.getElementById("tit_not").classList.remove("hidden");
        for(let i = 0; i< not_Array.length;i++){
                section.innerHTML += `
                <div class="containers">
                <table>
                    <tr>
                        <td rowspan="2">${not_Array[i]}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><button type="button" id="add_${not_Array[i]}" class="Add">Add</button></td>
                    </tr>
                </table>
                </div>
                `;
        }
    }
}

function populate(){
    console.log(users);
    console.log(friends);
    console.log(pending);
    populatePending(pending);
    populateFriends(friends);
    populateNotFriends(users);
}

function getFriends(){
    let url = `/acceptedFriends?userName=${userName}`;
    let settings = {
        method : 'GET',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Done friends");
            friends = responseJSON;
            populate();
        })
        .catch( err => {
            let main = document.getElementById("main");
            main.innerHTML = `<div class="error-msg">${err.message}</div>`;
        });
}


function getPending(){
    let url = `/pendingFriends?userName=${userName}`;
    let settings = {
        method : 'GET',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Done pending");
            pending = responseJSON;
            getFriends();
        })
        .catch( err => {
            let main = document.getElementById("main");
            main.innerHTML = `<div class="error-msg">${err.message}</div>`;
        });
}

function getNotFriends(){
    let url = `/notFriends?userName=${userName}`;
    let settings = {
        method : 'GET',
        headers : {
            Authorization : `Bearer ${API_KEY}`,
        }
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log("Done not friends");
            users = responseJSON;
            getPending();
        })
        .catch( err => {
            let main = document.getElementById("main");
            main.innerHTML = `<div class="error-msg">${err.message}</div>`;
        });
}

function watchPopulation(){
    let sec = document.getElementById("population");
    sec.addEventListener('click', (event) => {
        event.preventDefault();
        let str = String(event.target.id);
        let tipo = str.substring(0,3);
        let name = str.substring(4)
        console.log(tipo, name);
        if(tipo == "del"){
            deleteFriend(userName, name);
        }
        else if(tipo == "add"){
            sendRequest(userName, name);
        }
        else if(tipo == "acc"){
            confirmRequest(userName, name);
        }
    });
}

function watchNav(){
    let nav = document.getElementById("nav-ul");
    nav.addEventListener('click', (event)=>{
        event.preventDefault();
        console.log(event.target.id);
        if(event.target.id == "home"){
            window.location.href = "/pages/user.html";
        }
        if(event.target.id == "account"){
            window.location.href = "/pages/account.html";
        }
        if(event.target.id == "post"){
            window.location.href = "/pages/post.html";
        }
        if(event.target.id == "friends"){
            window.location.href = "/pages/friends.html";
        }
        if(event.target.id == "about"){
            window.location.href = "/pages/about.html";
        }
        if(event.target.id == "contact"){
            window.location.href = "/pages/contact.html";
        }
    });
    let log_out = document.getElementById("log_out");
    log_out.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('token');
        window.location.href = "./user_entry.html";
    });
}

function init(){
    watchNav();
    getNotFriends();
    watchPopulation();
}

validate();
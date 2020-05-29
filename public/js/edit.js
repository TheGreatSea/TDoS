const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';

console.log("Page start")
let userName = "";
let id = "";
let friendList = [];

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
            friendList = responseJSON;
            console.log(friendList);
        })
        .catch( err => {
            window.alert("Problem finding list of friends.");
            location.reload();
        });
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
            console.log(responseJSON);
            getFriends();
            init();
        })
        .catch( err => {
            window.alert("Session expired. Redirecting");
            localStorage.removeItem('token');
            window.location.href = "./user_entry.html";
        });
}


function watchAddTag(){
    let add_tag = document.getElementById("add_tag");
    add_tag.addEventListener('click', (event)=>{
        event.preventDefault();
        let tag_div = document.getElementById("tag_div");
        let newInput = document.createElement('div');
        newInput.innerHTML = '<input type="text" class="tags"/>';
        tag_div.appendChild(newInput);
    });
}

function patchSummary(summaryId){
    let title = document.getElementById("title").value;
    let source = document.getElementById("source").value;
    let tags = document.getElementsByClassName("tags");
    let share = document.getElementsByName("share");
    let body = document.getElementById("summary_body").value;

    let tags_Array = [];
    let message = document.getElementById("message-create");
    for(let  i = 0; i < tags.length; i++){
        if(tags[i].value != ""){
            let tag = tags[i].value;
            tag.toLowerCase();
            tags_Array.push(tag);
        }
    }
    for(let i = 0; i < share.length; i++){
        if(share[i].checked == true){
            share = [share[i].value];
            break;
        }
    }
    if (share[0] == "friends"){
        for(let i = 0; i < friendList.length; i++){
            share.push(friendList[i].friendName);
        }
    }
    
    let summaryobj = {
        summaryCreator: userName,
        summaryName: title,
        summarySource: source,
        summaryTags: tags_Array,
        share: share,
        summary: body 
    }
    console.log(summaryobj);
    
    let url = `/summary?summaryId=${summaryId}`;
    let settings = {
        method : 'PATCH',
        headers : { 
            Authorization : `Bearer ${API_KEY}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( summaryobj )
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            console.log(responseJSON);
            window.location.href = "./user.html";    
        })
        .catch( err => {
            message.innerHTML = err.message;
            console.log(err.message);
        });
}

function watchCreateButton(){
    let button = document.getElementById("createSummary");
    button.addEventListener('click',(event)=>{
        event.preventDefault();
        let summaryId = localStorage.getItem('summaryId');
        patchSummary(summaryId);
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

function populateFields(summary){
    let title = document.getElementById("title");
    let source = document.getElementById("source");
    let tag_div = document.getElementById("tag_div");
    let share = document.getElementsByName("share");
    let body = document.getElementById("summary_body");

    title.value = summary.summaryName;
    source.value = summary.summarySource;
    if (share[0] == 'private'){
        document.getElementById("private").checked = true ;
    }
    else if (share[0] == 'public'){
        document.getElementById("public").checked = true ;
    }
    else if (share[0] == 'friends'){
        share = ['friends'];
        document.getElementById("friends").checked = true ;
    }
    for(let i=0; i< summary.summaryTags.length; i++){
        let newInput = document.createElement('div');
        newInput.innerHTML = `<input type="text" class="tags" value="${summary.summaryTags[i]}"/>`;
        tag_div.appendChild(newInput);
    }
    body.value = summary.summary;
}

function getSummaryInfo(){
    let summaryId = localStorage.getItem('summaryId');
    console.log(summaryId);
    let url = `/summaryById?summaryId=${summaryId}`;
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
            console.log("Info obtained.")
            populateFields(responseJSON[0]);
        })
        .catch( err => {
            window.alert("Error: " + err.message);
        });
}


function init() {
    watchNav();
    watchCreateButton()
    watchAddTag();
    getSummaryInfo();
}



validate();
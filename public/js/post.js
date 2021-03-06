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

function getSummary(url_link, num_sentences){
    console.log("Request summary");
    let url = `https://meaningcloud-summarization-v1.p.rapidapi.com/summarization-1.0?url=${url_link}&sentences=${num_sentences}`;
    let settings = {
        method : 'GET',
        headers : { 
            "x-rapidapi-host": "meaningcloud-summarization-v1.p.rapidapi.com",
            "x-rapidapi-key": "ed8ac217c8msh798b9c1ba0c7b5dp122e46jsn695ab49d0ffc",
            "accept": "application/json"
        }
    }
    fetch(url,settings)
        .then(response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            document.getElementById("source").value = url_link;
            document.getElementById("summary_body").value = responseJSON.summary;
            let createForm = document.getElementById("createForm");
            createForm.classList.remove("hidden");
            window.scrollTo(0,document.body.scrollHeight);
            console.log(responseJSON);
        })
        .catch(err => {
            console.log(err);
            let message = document.getElementById("message-summary");
            message.innerHTML = err.message;
        });
}

function doSummary(text, num_sentences){
    console.log("Request summary");
    let url = `https://meaningcloud-summarization-v1.p.rapidapi.com/summarization-1.0?txt=${String(text)}&sentences=${num_sentences}`;
    let settings = {
        method : 'GET',
        headers : { 
            "x-rapidapi-host": "meaningcloud-summarization-v1.p.rapidapi.com",
            "x-rapidapi-key": "ed8ac217c8msh798b9c1ba0c7b5dp122e46jsn695ab49d0ffc",
            "accept": "application/json"
        }
    }
    fetch(url,settings)
        .then(response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            document.getElementById("summary_body").value = responseJSON.summary;
            let createForm = document.getElementById("createForm");
            createForm.classList.remove("hidden");
            window.scrollTo(0,document.body.scrollHeight);
            console.log(responseJSON);
        })
        .catch(err => {
            console.log(err);
            let message = document.getElementById("message-summary");
            message.innerHTML = err.message;
        });
}

function createSummary(){
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
    
    let url = `/summary`;
    let settings = {
        method : 'POST',
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
            addSummaryToUser(userName, responseJSON.id);
            window.location.href = "./user.html";    
        })
        .catch( err => {
            message.innerHTML = err.message;
            console.log(err.message);
        });
}

function addSummaryToUser(name, summaryId){
    let message = document.getElementById("message-create");
    let url = `/userSummary?userName=${name}&summaryId=${summaryId}`;
    let settings = {
        method : 'POST',
        headers : { 
            Authorization : `Bearer ${API_KEY}`
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
            console.log(responseJSON);
            //window.location.href = "/pages/user.html";    
        })
        .catch( err => {
            message.innerHTML = err.message;
            console.log(err.message);
        });
}

function watchGetSummaryButton(){
    let button = document.getElementById("getSummary");
    button.addEventListener('click', (event) =>{
        event.preventDefault();
        let url = document.getElementById("linktext").value;
        let num_sentences = document.getElementById("quantity").value;
        document.getElementById("linktext").value = "";
        if(url == ""  || num_sentences == ""){
            document.getElementById("message-summary").innerHTML = "Missing Fields";
        }
        else{
            console.log(url);
            getSummary(url, num_sentences);
        }
    });
}

function watchDoSummaryButton(){
    let button = document.getElementById("doSummary");
    button.addEventListener('click', (event) =>{
        event.preventDefault();
        let text = document.getElementById("summary_text").value;
        let num_sentences = document.getElementById("quantity").value;
        document.getElementById("summary_text").value = "";
        if(text == ""  || num_sentences == ""){
            document.getElementById("message-summary").innerHTML = "Missing Fields";
        }
        else{
            console.log(text);
            doSummary(text, num_sentences);
        }
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

function watchCreateButton(){
    let button = document.getElementById("createSummary");
    button.addEventListener('click',(event)=>{
        event.preventDefault();
        createSummary();
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

function init() {
    watchDoSummaryButton()
    watchGetSummaryButton()
    watchNav();
    watchCreateButton()
    watchAddTag();
}



validate();

/*
*/
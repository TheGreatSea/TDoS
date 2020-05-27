const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';

let userName = "";
let id = "";
let friendList = [];
let first_position = 0;
let last_position = 9;
let prev_btn = document.querySelector('#prev');
let next_btn = document.querySelector('#next');

let public_feed = [];
let filered_feed = [];
let filter = false;

let feed = [];

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
        })
        .catch( err => {
            localStorage.removeItem('token');
        });
}

function getPublicFeed(){
    let url = `/summaryPublic`;
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
            console.log(responseJSON);
            responseJSON.reverse();
            public_feed = responseJSON;
            feed = public_feed;
            generateFeed();
        })
        .catch( err => {
            let main = document.getElementById("main");
            main.innerHTML = `<div class="error-msg">${err.message}</div>`;
        });
}

function generateFeed(){ 
    if (feed != 0){
        if(feed.length < 10){
            first_position = 0;
            last_position = feed.length;
            document.getElementById("prev").classList.add("hidden");
            document.getElementById("next").classList.add("hidden");
        }
        else if (first_position <= 0){
            first_position = 0;
            last_position = 9;
            document.getElementById("prev").classList.add("hidden");
            document.getElementById("next").classList.remove("hidden");
        }
        else if (last_position > feed.length){
            //first_position += 10 ;
            last_position = feed.length;
            document.getElementById("prev").classList.remove("hidden");
            document.getElementById("next").classList.add("hidden");
        }
        else{
            document.getElementById("prev").classList.remove("hidden");
            document.getElementById("next").classList.remove("hidden");
        }
        let main = document.getElementById("main");
        main.innerHTML = "";
        for( let i = first_position ; i< last_position; i++){
            let tags = "";
            for(let j = 0; j< feed[i].summaryTags.length; j++){
                tags += `<div class = "tags">${feed[i].summaryTags[j]}</div>`
            }
            let today = new Date(feed[i].date);
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0');
            let yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;
            
            main.innerHTML += `
                <form id="${feed[i].id}" class="feed">
                <table>
                    <thead>
                        <tr>
                            <th class="Title" colspan="10"><h3>${feed[i].summaryName}</h3></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowspan="1" class="info">
                                Tags
                            </td>
                            <td class="info_dump" rowspan="3" colspan="9">
                                ${feed[i].summary}
                            </td>
                        </tr>
                        <tr>
                            <td rowspan="2" class="info">
                                ${tags}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td  colspan="10">
                               Creator: ${feed[i].summaryCreator}
                            </td>
                            <td  colspan="2" class="hidden">
                                <button type="submit" class="saveBtn"> Save </button>
                            </td>
                            <td colspan="6" class="hidden">${feed[i].share}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="10">
                                Source: ${feed[i].summarySource}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="10">Date created: ${today}</td>
                        </tr>
                    </tfoot>
                </table>
                </form>
            `;
        }
    }
}

function watchFeedBtn(){
    prev_btn.addEventListener('click', (event)=>{
        window.scrollTo(0, 0);
        first_position -= 10;
        last_position -= 10;
        generateFeed(feed);
        event.preventDefault();
    });
    next_btn.addEventListener('click', (event)=>{
        window.scrollTo(0, 0);
        first_position += 10;
        last_position += 10;
        generateFeed(feed);
        event.preventDefault();
    });
}


function watchFilter() {
    let form = document.getElementById("filter-form");
    form.addEventListener('submit',(event)=>{
        event.preventDefault();
        let filter_value = String(document.getElementById("filter-value").value);
        console.log(filter_value);
        if(filter_value == ""){
            console.log(public_feed);
            feed = public_feed;
            generateFeed();
        }
        else{
            filter_value = filter_value.toLowerCase();
            let field = document.getElementById("filter-field").value;
            filered_feed = [];
            for(let i=0; i< public_feed.length; i++){
                if(field == "Title"){
                    let str = String(public_feed[i].summaryName).toLowerCase();
                    if(str.includes(filter_value)){
                        filered_feed.push(public_feed[i]);
                    }
                }
                else if(field == "Creator"){
                    let str = String(public_feed[i].summaryCreator).toLowerCase();
                    if(str.includes(filter_value)){
                        filered_feed.push(public_feed[i]);
                    }
                }
                else if(field == "Source"){
                    let str = String(public_feed[i].summarySource).toLowerCase();
                    if(str.includes(filter_value)){
                        filered_feed.push(public_feed[i]);
                    }
                }
                else if(field == "Tags"){
                    for(let j = 0; j< feed[i].summaryTags.length; j++){
                        let str = String(public_feed[i].summaryTags[j]).toLowerCase();
                        if(str.includes(filter_value)){
                            filered_feed.push(public_feed[i]);
                            break;
                        }
                    }
                }
                else if(field == "Summary"){
                    let str = String(public_feed[i].summary).toLowerCase();
                    if(str.includes(filter_value)){
                        filered_feed.push(public_feed[i]);
                    }
                }
            }
            feed = filered_feed;
            generateFeed();
        }
    });
}

function init(){
    getPublicFeed();
    watchFeedBtn();
    watchFilter();
}
validate();
init();
/*
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getBookmarks(){
    let url = '/bookmarks';
    let settings = {
        method: 'GET',
        headers: {
            Authorization : `Bearer ${API_TOKEN}`
        }
    }
    let results = document.querySelector( '.bookmark-section' );
    fetch(url, settings)
        .then (response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then( responseJSON => {
            results.innerHTML = "";
            for ( let i = 0; i < responseJSON.length; i++ ){
                results.innerHTML += `
                <p>           
                    <div>Id: ${responseJSON[i].id}</div> 
                    <div>Title: ${responseJSON[i].title}</div>
                    <div>Description :${responseJSON[i].description}</div> 
                    <div>URL: ${responseJSON[i].url}</div>
                    <div>Rating: ${responseJSON[i].rating}</div>
                </p>`;
            }
        })
        .catch(err => {
            results.innerHTML = err.message;
        });
}

function  getTitles(title){
    let url = `/bookmark?title=${title}`;
    let settings = {
        method: 'GET',
        headers: {
            Authorization : `Bearer ${API_TOKEN}`
        }
    }
    let results = document.querySelector( '.bookmark-section' );
    fetch(url, settings)
        .then (response => {
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then( responseJSON => {
            results.innerHTML = "";
            for ( let i = 0; i < responseJSON.length; i++ ){
                results.innerHTML += `
                <p>           
                    <div>Id: ${responseJSON[i].id}</div> 
                    <div>Title: ${responseJSON[i].title}</div>
                    <div>Description :${responseJSON[i].description}</div> 
                    <div>URL: ${responseJSON[i].url}</div>
                    <div>Rating: ${responseJSON[i].rating}</div>
                </p>`;
            }
        })
        .catch(err => {
            results.innerHTML = err.message;
        });
}

function watchGetForm(){
    let form = document.querySelector(".form-get");
    form.addEventListener( 'submit', (event) => {
        console.log("Get all bookmarks")
        event.preventDefault();
        getBookmarks();
    });
}

function watchTitleForm(){
    let form = document.querySelector(".form-title");
    form.addEventListener( 'submit', (event) => {
        event.preventDefault();
        let title = document.querySelector("#getTitle").value;
        getTitles(title);
    });
}

//////////////////////////////////////////////////////////////////////////////////
function addBookmarks(Bookmark){
    let url = `/bookmarks`
    let settings = {
        method : 'POST',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( Bookmark )
    }
    let results = document.querySelector( '.bookmark-section' );
    fetch( url, settings )
        .then( response => {
            if ( response.ok ){
                return response.json();
            }
            throw new Error( response.statusText );
        })
        .then( responseJSON => {
            console.log(responseJSON);
            getBookmarks();            
        })
        .catch( err => {
            results.innerHTML = err.message;
        })
}


function watchAddForm(){
    let form = document.querySelector(".form-add");
    form.addEventListener( 'submit', (event) => {
        event.preventDefault();
        let title = document.getElementById('bookmarkTitle').value;
        let description = document.getElementById('bookmarkDesc').value;
        let url = document.getElementById('bookmarkUrl').value;
        let rating = document.getElementById('bookmarkRate').value;
        if (!title || !description || !url || !rating){
            window.alert("All fields must be filled");
        }
        else{
            let Bookmark = {
                title : title,
                description : description,
                url: url,
                rating : rating
            }
            console.log(Bookmark);
            addBookmarks(Bookmark);
        }
    });
}
////////////////////////////////////////////////////////////////////////
function deleteBookmarks(id){
    let url = `/bookmark/${id}`
    let settings = {
        method : 'DELETE',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`
        }
    }
    let results = document.querySelector( '.bookmark-section' );
    fetch( url, settings )
        .then( response => {
            if ( response.ok ){
                return response.json();
            }
            throw new Error( response.statusText );
        })
        .then( responseJSON => {
            console.log(responseJSON);
            getBookmarks();            
        })
        .catch( err => {
            results.innerHTML = err.message;
        })
}

function watchDeleteForm(){
    let form = document.querySelector(".form-delete");
    form.addEventListener( 'submit', (event) => {
        event.preventDefault();
        let id = document.querySelector("#deleteID").value;
        deleteBookmarks(id);
    });
}
////////////////////////////////////////////////////////////////////////////
function updateBookmarks(id, Bookmark){
    let url = `/bookmark/${id}`
    let settings = {
        method : 'PATCH',
        headers : {
            Authorization : `Bearer ${API_TOKEN}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( Bookmark )
    }
    let results = document.querySelector( '.bookmark-section' );
    fetch( url, settings )
        .then( response => {
            if ( response.ok ){
                return response.json();
            }
            throw new Error( response.statusText );
        })
        .then( responseJSON => {
            console.log(responseJSON);
            getBookmarks();            
        })
        .catch( err => {
            results.innerHTML = err.message;
        })
}

function watchUpdateForm(){
    let form = document.querySelector(".form-update");
    form.addEventListener( 'submit', (event) => {
        event.preventDefault();
        let id = document.getElementById('updateId').value;
        let title = document.getElementById('updateTitle').value;
        let description = document.getElementById('updateDesc').value;
        let url = document.getElementById('updateUrl').value;
        let rating = document.getElementById('updateRate').value;
        
        let Bookmark = {
            id: id
        }
        
        if (title) {
            Bookmark['title'] = title;
        }
        if (description) {
            Bookmark['description'] = description;
        }
        if (url) {
            Bookmark['url'] = url;
        }
        if (rating) {
            Bookmark['rating'] = rating;
        }
        console.log(Bookmark);
        updateBookmarks(id, Bookmark);
    });
}
/////////////////////////////////////////////////////////////////////////////////

function init(){
    console.log("Inicializado")
    watchGetForm();
    watchAddForm();
    watchDeleteForm();
    watchUpdateForm();
    watchTitleForm();
}

init();
*/
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
            window.location.href = "./pages/user.html";
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
        if(feed.length <= 10){
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

function watchNav(){
    let nav = document.getElementById("nav-ul");
    nav.addEventListener('click', (event)=>{
        event.preventDefault();
        console.log(event.target.id);
        if(event.target.id == "home"){
            window.location.href = "/index.html";
        }
        if(event.target.id == "account"){
            window.location.href = "/pages/user_entry.html";
        }
        if(event.target.id == "about"){
            window.location.href = "/pages/about.html";
        }
        if(event.target.id == "contact"){
            window.location.href = "/pages/contact.html";
        }
    });
}

function init(){
    watchNav();
    getPublicFeed();
    watchFeedBtn();
    watchFilter();
}
validate();
init();
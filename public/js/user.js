const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';

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
            window.alert("Session expired. Redirecting");
            localStorage.removeItem('token');
            window.location.href = "./user_entry.html";
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
}

validate();
init();
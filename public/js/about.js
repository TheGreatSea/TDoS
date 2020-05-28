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
}
init();
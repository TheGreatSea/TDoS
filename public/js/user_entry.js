const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';
account_user = "";
console.log("Page start")

function watchShowHidden(){
    let login = document.getElementById('login-sec');
    let signUp = document.getElementById('showSignUp');
    signUp.addEventListener('click', (event) =>{
        event.preventDefault();
        login.classList.add("hidden");
        document.getElementById('signUp-sec').classList.remove("hidden");
    });
}

function createAccount(username, password){
    let url = `/users/register`;
    let message = document.getElementById("sign-message");
    let user = {
        userName: username, 
        userPassword: password
    }
    let settings = {
        method : 'POST',
        headers : { 
            Authorization : `Bearer ${API_KEY}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( user )
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
            location.reload();
            //enteraccount(responseJSON.userName, responseJSON.userPassword);
        })
        .catch( err => {
            message.innerHTML = err.message;
            console.log(err.message);
        });
}

function enteraccount(username, password){
    let url = `/users/login`;
    let message = document.getElementById("login-message");
    let user = {
        userName: username, 
        userPassword: password
    }
    let settings = {
        method : 'POST',
        headers : { 
            Authorization : `Bearer ${API_KEY}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( user )
    }
    fetch(url,settings)
        .then(response =>{
            if (response.ok){
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJSON =>{
            localStorage.setItem('token', responseJSON.token);
            console.log(responseJSON);
            window.location.href = "/index.html";    
        })
        .catch( err => {
            message.innerHTML = err.message;
            console.log(err.message);
        });
}

function watchLogin(){
    let form = document.getElementById("login");
    form.addEventListener( 'submit', (event) =>{
        event.preventDefault();
        console.log("click");
        let username = document.getElementById("usernameLogin").value;
        let password = document.getElementById("passwordLogin").value;
        if(!username || !password){
            password = "";
            let message = document.getElementById("login-message");
            message.innerHTML = "Username or Password fields are missing. Try again.";
        }
        else
            enteraccount(username, password);
    });
}

function watchSignUp(){
    let form = document.getElementById("sign-up");
    form.addEventListener( 'submit', (event) =>{
        event.preventDefault();
        let message = document.getElementById("sign-message");
        let username = document.getElementById("usernamesignUp").value;
        let password = document.getElementById("passwordsignUp").value;
        let repeatPassword = document.getElementById("passwordRepeatSignUp").value;
        if(!username || !password || !repeatPassword){
            document.getElementById("passwordsignUp").value = '';
            document.getElementById("passwordRepeatSignUp").value = '';
            message.innerHTML = "Username or Password fields are missing. Try again.";
        }
        else if(password !== repeatPassword){
            document.getElementById("passwordsignUp").value = '';
            document.getElementById("passwordRepeatSignUp").value = '';
            message.innerHTML = "Password fields are not the same. Try again.";
        }
        else{
            createAccount(username, password);
        }        
    });
}


function init(){
    watchShowHidden();
    watchLogin();
    watchSignUp();
}

init();
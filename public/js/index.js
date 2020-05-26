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
            document.querySelector('#section1').innerHTML = `
            <div> 
            <p>${responseJSON.userName}</p>
            <p>${responseJSON.id}</p>
            </div>
            `;
            console.log(responseJSON);
        })
        .catch( err => {
            window.alert("Session expired. Redirecting");
            localStorage.removeItem('token');
            window.location.href = "/user_entry.html";
        });
}

validate();

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
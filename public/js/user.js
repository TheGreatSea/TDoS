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
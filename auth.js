console.log("Auth JS loaded");


// SIGNUP

window.signup = function(){

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm").value;


    if(email === "" || password === "" || confirmPassword === ""){
        alert("Please fill all fields");
        return;
    }


    if(password !== confirmPassword){
        alert("Passwords do not match");
        return;
    }


    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);


    alert("Account Created Successfully");


    window.location.href = "login.html";

};



// LOGIN

window.login = function(){

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;


    let savedEmail = localStorage.getItem("userEmail");
    let savedPassword = localStorage.getItem("userPassword");


    if(email === savedEmail && password === savedPassword){


        localStorage.setItem("isLoggedIn","true");


        alert("Login Successful");


        window.location.href="setpin.html";


    }
    else{

        alert("Wrong email or password");

    }

};



// SET PIN

window.setPin = function(){

    let pin = document.getElementById("pin").value;
    let confirmPin = document.getElementById("confirmPin").value;


    if(pin.length !== 4){

        alert("PIN must be 4 digits");
        return;

    }


    if(pin !== confirmPin){

        alert("PIN does not match");
        return;

    }


    localStorage.setItem("userPin",pin);


    alert("PIN created successfully");


    window.location.href="index.html";

};



// UNLOCK PIN

window.unlockPin = function(){

    let pin = document.getElementById("pin").value;

    let savedPin = localStorage.getItem("userPin");


    if(pin === savedPin){


        sessionStorage.setItem("pinUnlocked","true");


        window.location.href="index.html";


    }
    else{

        alert("Wrong PIN");

    }

};
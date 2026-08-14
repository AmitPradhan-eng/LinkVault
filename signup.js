console.log("Signup JS Loaded");

import { auth } from "./firebase.js";

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


window.signup = async function(){


    const email =
    document.getElementById("email").value.trim();


    const password =
    document.getElementById("password").value;


    const confirm =
    document.getElementById("confirm").value;



    if(password !== confirm){

        alert("Passwords do not match");
        return;

    }



    try{


        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


        console.log(
            "User created:",
            userCredential.user.email
        );



        // Keep your existing app system

        localStorage.setItem(
            "userEmail",
            email
        );



        window.location.href =
        "setpin.html";



    }
    catch(error){


        alert(error.message);


        console.error(error);


    }


};
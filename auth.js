

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("Auth JS loaded");
// =====================================
// SIGNUP
// =====================================

window.signup = async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirm").value;


    if (
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        alert("Please fill all fields");

        return;

    }


    if (password !== confirmPassword) {

        alert("Passwords do not match");

        return;

    }


    if (password.length < 6) {

        alert("Password must be at least 6 characters");

        return;

    }


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "✅ Firebase account created:",
            user.uid
        );


        // Keep email temporarily for compatibility
        // with the current LinkVault system.

        localStorage.setItem(
            "userEmail",
            user.email
        );


        // IMPORTANT:
        // We no longer store the password
        // in localStorage.


        alert("Account Created Successfully");


        window.location.href = "setpin.html";


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );


        if (error.code === "auth/email-already-in-use") {

            alert("This email is already registered.");

        }

        else if (error.code === "auth/invalid-email") {

            alert("Please enter a valid email.");

        }

        else if (error.code === "auth/weak-password") {

            alert("Password must be at least 6 characters.");

        }

        else {

            alert(error.message);

        }

    }

};



// =====================================
// LOGIN
// =====================================

window.login = async function () {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (!email || !password) {

        alert("Please enter email and password.");

        return;

    }


    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "✅ Firebase login successful:",
            user.uid
        );


        // Keep email temporarily for the
        // current LinkVault data system.

        localStorage.setItem(
            "userEmail",
            user.email
        );


        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        alert("Login Successful");


        window.location.href =
            "setpin.html";


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            alert("Wrong email or password.");

        }

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            alert("Account not found.");

        }

        else {

            alert(error.message);

        }

    }

};



// =====================================
// FORGOT PASSWORD
// =====================================

window.resetPassword = async function () {

    const emailElement =
        document.getElementById("resetEmail");


    if (!emailElement) {

        console.error(
            "resetEmail input not found"
        );

        return;

    }


    const email =
        emailElement.value.trim();


    if (!email) {

        alert("Please enter your email.");

        return;

    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );


        alert(
            "✅ Password reset link sent. " +
            "Please check your email."
        );


    } catch (error) {

        console.error(
            "Password Reset Error:",
            error
        );


        if (
            error.code ===
            "auth/invalid-email"
        ) {

            alert("Please enter a valid email.");

        }

        else {

            alert(error.message);

        }

    }

};



// =====================================
// SET PIN
// =====================================

// =====================================
// SET PIN — FIREBASE
// =====================================

async function hashPIN(pin) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(pin);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


// =====================================
// SET PIN — SAVE TO FIREBASE
// =====================================

window.setPin = async function () {

    const pin =
        document.getElementById("pin").value.trim();

    const confirmPin =
        document.getElementById("confirmPin").value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if (!/^\d{4}$/.test(pin)) {

        alert("PIN must be exactly 4 digits.");

        return;

    }


    if (pin !== confirmPin) {

        alert("PIN does not match.");

        return;

    }


    // =====================================
    // CHECK FIREBASE USER
    // =====================================

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Your Firebase session has expired. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        // =================================
        // SAVE PIN TO FIRESTORE
        // =================================

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                privatePin:
                    pin,

                email:
                    user.email,

                updatedAt:
                    new Date()

            },
            {
                merge: true
            }
        );


        console.log(
            "🔐 Private PIN saved to Firebase"
        );


        // =================================
        // SESSION UNLOCK
        // =================================

        sessionStorage.setItem(
            "pinUnlocked",
            "true"
        );


        alert(
            "✅ PIN created successfully"
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "❌ PIN save error:",
            error
        );


        alert(
            "Unable to save PIN: " +
            error.message
        );

    }

};



// =====================================
// UNLOCK PIN
// =====================================

// =====================================
// UNLOCK PIN — FIREBASE
// =====================================

window.unlockPin = async function () {

    const pin =
        document
            .getElementById("pin")
            ?.value
            .trim();


    if (!/^\d{4}$/.test(pin)) {

        alert(
            "Please enter your 4-digit PIN."
        );

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login to your LinkVault account first."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(
                userRef
            );


        if (!snapshot.exists()) {

            alert(
                "No LinkVault profile found."
            );

            return;

        }


        const userData =
            snapshot.data();


        if (!userData.pinHash) {

            alert(
                "PIN is not set. Please create a PIN first."
            );

            window.location.href =
                "setpin.html";

            return;

        }


        const enteredHash =
            await hashPIN(pin);


        if (
            enteredHash ===
            userData.pinHash
        ) {

            console.log(
                "🔓 PIN verified from Firebase"
            );


            sessionStorage.setItem(
                "pinUnlocked",
                "true"
            );


            window.location.href =
                "index.html";

        }

        else {

            alert(
                "❌ Wrong PIN"
            );

        }

    }

    catch (error) {

        console.error(
            "❌ PIN Verification Error:",
            error
        );


        alert(
            "Unable to verify PIN: " +
            error.message
        );

    }

};
// =====================================
// FORGOT PIN - VERIFY ACCOUNT
// =====================================

window.verifyForgotPin = async function () {

    const email =
        document.getElementById("forgotPinEmail").value.trim();

    const password =
        document.getElementById("forgotPinPassword").value;


    if (!email || !password) {

        alert("Please enter your email and password.");

        return;

    }


    try {

        const user = auth.currentUser;


        if (!user) {

            alert(
                "Please login to your LinkVault account first."
            );

            return;

        }


        if (user.email !== email) {

            alert(
                "The email does not match the current account."
            );

            return;

        }


        const credential =
            EmailAuthProvider.credential(
                email,
                password
            );


        await reauthenticateWithCredential(
            user,
            credential
        );


        console.log(
            "✅ Account verified for PIN reset"
        );


        document.getElementById(
            "newPinSection"
        ).style.display = "block";


        alert(
            "✅ Account verified. " +
            "Create your new PIN."
        );


    } catch (error) {

        console.error(
            "PIN verification error:",
            error
        );


        alert(
            "Account verification failed. " +
            "Please check your password."
        );

    }

};



// =====================================
// FORGOT PIN - CREATE NEW PIN
// =====================================

window.resetPin = function () {

    const newPin =
        document.getElementById("newPin").value;

    const confirmNewPin =
        document.getElementById("confirmNewPin").value;


    if (!/^\d{4}$/.test(newPin)) {

        alert(
            "PIN must be exactly 4 digits."
        );

        return;

    }


    if (newPin !== confirmNewPin) {

        alert(
            "PIN does not match."
        );

        return;

    }


    localStorage.setItem(
        "userPin",
        newPin
    );


    sessionStorage.setItem(
        "pinUnlocked",
        "true"
    );


    alert(
        "✅ New PIN created successfully!"
    );


    window.location.href =
        "index.html";

};
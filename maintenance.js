// import { db } from "./firebase.js";

// import {
//     doc,
//     getDoc
// } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// async function checkMaintenanceMode() {

//     try {

//         const configRef =
//             doc(db, "system", "config");

//         const configSnapshot =
//             await getDoc(configRef);


//         if (!configSnapshot.exists()) {
//             return;
//         }


//         const data =
//             configSnapshot.data();


//         if (data.maintenanceMode === true) {

//             if (
//                 !window.location.pathname.endsWith(
//                     "maintenance.html"
//                 )
//             ) {

//                 window.location.replace(
//                     "maintenance.html"
//                 );

//             }

//         }

//     }
//     catch (error) {

//         console.error(
//             "Maintenance check failed:",
//             error
//         );

//     }

// }


// checkMaintenanceMode();

console.log("🔥 MAINTENANCE JS IS RUNNING");

console.log("🚧 MAINTENANCE JS LOADED");

import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function checkMaintenanceMode() {

    console.log("Checking Firebase...");

    try {

        const configRef = doc(db, "system", "config");

        const configSnapshot = await getDoc(configRef);

        console.log("Document exists:", configSnapshot.exists());

        if (!configSnapshot.exists()) {
            console.log("❌ system/config does not exist");
            return;
        }

        const data = configSnapshot.data();

        console.log("Maintenance value:", data.maintenanceMode);

        if (data.maintenanceMode === true) {

            console.log("🚧 MAINTENANCE ON");

            window.location.replace("maintenance.html");

        } else {

            console.log("✅ MAINTENANCE OFF");

        }

    } catch (error) {

        console.error("❌ MAINTENANCE ERROR:", error);

    }

}

checkMaintenanceMode();
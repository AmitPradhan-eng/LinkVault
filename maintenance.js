import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


async function checkMaintenanceMode() {

    try {

        const configRef =
            doc(db, "system", "config");

        const configSnapshot =
            await getDoc(configRef);


        if (!configSnapshot.exists()) {
            return;
        }


        const data =
            configSnapshot.data();


        if (data.maintenanceMode === true) {

            if (
                !window.location.pathname.endsWith(
                    "maintenance.html"
                )
            ) {

                window.location.replace(
                    "maintenance.html"
                );

            }

        }

    }
    catch (error) {

        console.error(
            "Maintenance check failed:",
            error
        );

    }

}


checkMaintenanceMode();
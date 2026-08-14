// ===========================
// Firebase Import
// ===========================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =========================================
// LINKVAULT PRANK MODE
// =========================================

async function checkPrankMode() {

    const prankLoading =
        document.getElementById("prankLoading");

    const prankOverlay =
        document.getElementById("prankOverlay");

    const prankReveal =
        document.getElementById("prankReveal");

    const upgradeBtn =
        document.getElementById("upgradeBtn");

    const enterLinkVault =
        document.getElementById("enterLinkVault");


    try {

        const configRef =
            doc(db, "system", "config");

        const configSnapshot =
            await getDoc(configRef);


        let prankEnabled = false;


        if (configSnapshot.exists()) {

            const config =
                configSnapshot.data();

            prankEnabled =
                config.prankMode === true;

            console.log(
                "🔥 Prank Mode:",
                prankEnabled
            );

        }


        // =====================================
        // PRANK ENABLED
        // =====================================

        if (prankEnabled) {

            prankOverlay.style.display = "flex";

            document.body.style.overflow = "hidden";


            upgradeBtn.onclick = () => {

                prankOverlay.style.display = "none";

                prankReveal.style.display = "flex";

            };


            enterLinkVault.onclick = () => {

                prankReveal.style.display = "none";

                document.body.style.overflow = "";

            };

        }


        // =====================================
        // FINISHED CHECKING
        // =====================================

        prankLoading.style.display = "none";


    }

    catch (error) {

        console.error(
            "❌ Prank Mode Error:",
            error
        );

        // Don't leave the loading screen stuck
        prankLoading.style.display = "none";

    }

}


// Start prank check
checkPrankMode();


// ===========================
// App Lock Protection
// ===========================

let savedEmail = localStorage.getItem("userEmail");
let savedPin = localStorage.getItem("userPin");

let currentUser = savedEmail;

console.log("Current User:", currentUser);


// No account
if (!savedEmail) {

    window.location.href = "signup.html";
    throw new Error("Signup required");

}


// PIN not created
if (!savedPin) {

    window.location.href = "setpin.html";
    throw new Error("Create PIN first");

}


// Always ask PIN when opening app

let unlocked = sessionStorage.getItem("pinUnlocked");


if (unlocked !== "true") {

    window.location.href = "pin.html";
    throw new Error("PIN required");

}



// ===========================
// Variables
// ===========================

let showFavorites = false;

const popup = document.getElementById("popup");

const saveBtn = document.getElementById("saveBtn");

const linksContainer = document.getElementById("linksContainer");


let editId = null;



// ===========================
// Add Link Popup
// ===========================


document.getElementById("openPopup").onclick = () => {

    popup.style.display = "flex";

};


document.getElementById("closePopup").onclick = () => {

    popup.style.display = "none";

};



// ===========================
// Load Links When App Opens
// ===========================


loadLinks();



// ===========================
// Save New Link
// ===========================


saveBtn.addEventListener("click", async () => {


    console.log("Save button clicked");



    const name =
        document.getElementById("linkName").value.trim();



    const url =
        document.getElementById("linkURL").value.trim();



    const category =
        document.getElementById("category").value;



    const note =
        document.getElementById("linkNote").value.trim();



    const favorite =
        document.getElementById("favorite").checked;



    if (!name || !url) {

        alert("Please fill all fields.");

        return;

    }



    const newLink = {


        id: Date.now(),


        name,


        url,


        note,


        category,


        favorite,


        date: new Date().toLocaleDateString()


    };



    try {


        await addDoc(
            collection(db, "users", currentUser, "links"),
            newLink
        );


        console.log("✅ Saved to Firebase");



    } catch (error) {


        console.error(error);


        alert(
            "Firebase Error: "
            + error.message
        );


        return;


    }




    // Clear Form


    document.getElementById("linkName").value = "";


    document.getElementById("linkURL").value = "";


    document.getElementById("linkNote").value = "";


    document.getElementById("favorite").checked = false;



    popup.style.display = "none";



    // Reload from Firebase

    loadLinks();



});

// ===========================
// Website Icon
// ===========================

function getWebsiteIcon(url) {


    if (url.includes("instagram"))
        return "📸";


    if (url.includes("youtube") || url.includes("youtu.be"))
        return "▶️";


    if (url.includes("amazon"))
        return "🛒";


    if (url.includes("flipkart"))
        return "🛍️";


    if (url.includes("github"))
        return "💻";


    if (url.includes("linkedin"))
        return "💼";


    return "🔗";


}



// ===========================
// Load Links From Firebase
// ===========================


async function loadLinks(searchText = "") {


    let links = [];



    try {


        const snapshot = await getDocs(
            collection(db, "users", currentUser, "links")
        );



        snapshot.forEach((document) => {


            links.push(document.data());


        });



    } catch (error) {


        console.error(
            "Loading Error:",
            error
        );


    }





    document.getElementById("totalLinks").textContent =
        links.length;



    linksContainer.innerHTML = "";





    const filteredLinks = links.filter(link => {


        let matchesSearch =
            link.name
                .toLowerCase()
                .includes(
                    searchText.toLowerCase()
                );



        let matchesFavorite =
            showFavorites ? link.favorite : true;



        return matchesSearch && matchesFavorite;



    });







    if (filteredLinks.length === 0) {


        linksContainer.innerHTML = `


        <p style="text-align:center;opacity:.7">

        No links found.

        </p>


        `;


        return;


    }








    filteredLinks.forEach(link => {



        linksContainer.innerHTML += `



        <div class="card">



        <h3>


        ${getWebsiteIcon(link.url)}



        ${link.favorite ? "⭐" : ""}



        ${link.name}



        </h3>





        <p class="url">

        ${link.url}

        </p>





        ${link.note ? `


        <p class="note">

        📝 ${link.note}

        </p>


        ` : ""}







        <div class="card-info">



        <span class="badge">

        ${link.category}

        </span>





        <small>

        📅 ${link.date}

        </small>



        </div>








        <div class="buttons">



        <button onclick="window.open('${link.url}','_blank')">

        🌐 Open

        </button>





        <button onclick="deleteLink('${link.id}')">

            🗑 Delete

        </button>





        <button onclick="toggleFavorite('${link.id}')">

            ⭐

        </button>

        <button onclick="editLink('${link.id}')">
            ✏️ Edit
        </button>





        </div>






        </div>



        `;



    });



}

// ===========================
// Delete Link
// ===========================

async function deleteLink(id) {


    try {


        const snapshot = await getDocs(
            collection(db, "users", currentUser, "links")
        );



        snapshot.forEach(async (document) => {


            let data = document.data();



            if (data.id == id) {


                await deleteDoc(
                    doc(db, "users", currentUser, "links", document.id)
                );


                console.log("Deleted from Firebase");


                loadLinks();


            }


        });



    } catch (error) {


        console.error(
            "Delete Error:",
            error
        );


    }


}





async function toggleFavorite(id) {

    try {

        const snapshot = await getDocs(
            collection(db, "users", currentUser, "links")
        );


        snapshot.forEach(async (document) => {


            let data = document.data();


            if (data.id == id) {


                await updateDoc(

                    doc(
                        db,
                        "users",
                        currentUser,
                        "links",
                        document.id
                    ),

                    {
                        favorite: !data.favorite
                    }

                );


                console.log(
                    "Favorite Updated"
                );


                loadLinks();


            }


        });


    } catch (error) {


        console.error(
            "Favorite Error:",
            error
        );


    }

}






// ===========================
// Edit Link
// ===========================


async function editLink(id) {


    const newName =
        prompt(
            "Enter new name:"
        );



    const newURL =
        prompt(
            "Enter new URL:"
        );



    if (!newName || !newURL)
        return;





    try {


        const snapshot =
            await getDocs(
                collection(db, "links")
            );



        snapshot.forEach(async (document) => {


            let data =
                document.data();



            if (data.id == id) {



                await updateDoc(

                    doc(
                        db,
                        "links",
                        document.id
                    ),

                    {


                        name: newName,


                        url: newURL


                    }

                );



                console.log(
                    "Updated"
                );



                loadLinks();



            }


        });



    } catch (error) {


        console.error(
            "Edit Error:",
            error
        );


    }



}

// ===========================
// Search
// ===========================


document
    .getElementById("search")
    .addEventListener("input", function () {


        loadLinks(this.value);


    });




// ===========================
// Show All Links
// ===========================


document.getElementById("allBtn").onclick = () => {


    showFavorites = false;


    loadLinks();


};




// ===========================
// Show Favorites
// ===========================


document.getElementById("favBtn").onclick = () => {


    showFavorites = true;


    loadLinks();


};





// ===========================
// Register Service Worker
// ===========================


if ("serviceWorker" in navigator) {


    window.addEventListener(
        "load",
        () => {


            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )


                .then(() => {


                    console.log(
                        "LinkVault App Ready"
                    );


                })


                .catch(error => {


                    console.log(
                        "Service Worker Error",
                        error
                    );


                });



        });


}






// ===========================
// Splash Screen
// ===========================


window.addEventListener(
    "load",
    () => {


        setTimeout(() => {


            const splash =
                document.getElementById(
                    "splash"
                );



            if (splash) {


                splash.classList.add(
                    "splash-hide"
                );



                setTimeout(() => {


                    splash.remove();


                }, 600);



            }



        }, 2000);



    });
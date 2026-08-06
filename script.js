// App Lock Protection

let savedEmail = localStorage.getItem("userEmail");
let savedPin = localStorage.getItem("userPin");


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


if(unlocked !== "true"){

    window.location.href = "pin.html";
    throw new Error("PIN required");

}
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
// Load Links On Start
// ===========================

loadLinks();


// ===========================
// Save New Link
// ===========================

saveBtn.addEventListener("click", () => {

    const name = document.getElementById("linkName").value.trim();

    const url = document.getElementById("linkURL").value.trim();

    const category = document.getElementById("category").value;

    const note = document.getElementById("linkNote").value.trim();

    const favorite = document.getElementById("favorite").checked;


    if (!name || !url) {

        alert("Please fill all fields.");

        return;
    }


    let links = JSON.parse(localStorage.getItem("links")) || [];


    links.unshift({

        id: Date.now(),

        name,

        url,

        note,

        category,

        favorite,

        date: new Date().toLocaleDateString()

    });


    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );


    // Clear form

    document.getElementById("linkName").value = "";

    document.getElementById("linkURL").value = "";

    document.getElementById("linkNote").value = "";

    document.getElementById("favorite").checked = false;


    popup.style.display = "none";


    loadLinks();

});


// ===========================
// Display Links
// ===========================

function getWebsite(url) {

    if (url.includes("instagram")) {
        return {
            icon: "📸",
            name: "Instagram"
        };
    }

    if (url.includes("youtube") || url.includes("youtu.be")) {
        return {
            icon: "▶️",
            name: "YouTube"
        };
    }

    if (url.includes("amazon")) {
        return {
            icon: "🛒",
            name: "Amazon"
        };
    }

    if (url.includes("flipkart")) {
        return {
            icon: "🛍️",
            name: "Flipkart"
        };
    }

    if (url.includes("github")) {
        return {
            icon: "💻",
            name: "GitHub"
        };
    }

    return {
        icon: "🔗",
        name: "Website"
    };

}

function loadLinks(searchText = "") {


    let links = JSON.parse(localStorage.getItem("links")) || [];


    document.getElementById("totalLinks").textContent = links.length;


    linksContainer.innerHTML = "";



    const filteredLinks = links.filter(link => {


        let matchesSearch =
            link.name
                .toLowerCase()
                .includes(searchText.toLowerCase());


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

    function getWebsiteIcon(url) {

        if (url.includes("instagram"))
            return "📸";

        if (url.includes("youtube"))
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



    filteredLinks.forEach(link => {
        const site = getWebsite(link.url);


        linksContainer.innerHTML += `


        <div class="card">


            <h3>

                ${getWebsiteIcon(link.url)}

                ${link.favorite ? "<span class='fav'>⭐</span>" : ""}

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


                <span class="badge ${link.category.toLowerCase()}">

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



                <button onclick="editLink(${link.id})">

                    ✏️ Edit

                </button>

                <button onclick="toggleFavorite(${link.id})">

                ⭐

                </button>



                <button onclick="deleteLink(${link.id})">

                    🗑 Delete

                </button>


            </div>


        </div>


        `;


    });

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
// Delete Link
// ===========================

function deleteLink(id) {


    let links =
        JSON.parse(localStorage.getItem("links")) || [];



    links =
        links.filter(link => link.id !== id);



    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );



    loadLinks(
        document.getElementById("search").value
    );


}


// ===========================
// Edit Link
// ===========================

function editLink(id) {


    let links =
        JSON.parse(localStorage.getItem("links")) || [];



    let link =
        links.find(item => item.id === id);



    editId = id;



    document.getElementById("editName").value = link.name;


    document.getElementById("editURL").value = link.url;


    document.getElementById("editCategory").value = link.category;



    document
        .getElementById("editPopup")
        .style.display = "flex";


}



// Close Edit Popup

document.getElementById("closeEdit").onclick = () => {

    document.getElementById("editPopup").style.display = "none";

};



// Update Link

document.getElementById("updateBtn").onclick = () => {


    let links =
        JSON.parse(localStorage.getItem("links")) || [];



    let link =
        links.find(item => item.id === editId);



    link.name =
        document.getElementById("editName").value;


    link.url =
        document.getElementById("editURL").value;


    link.category =
        document.getElementById("editCategory").value;



    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );



    document
        .getElementById("editPopup")
        .style.display = "none";



    loadLinks();

};


// ===========================
// Toggle Favorite
// ===========================

function toggleFavorite(id) {

    let links =
        JSON.parse(localStorage.getItem("links")) || [];


    let link =
        links.find(item => item.id === id);


    link.favorite = !link.favorite;


    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );


    loadLinks(
        document.getElementById("search").value
    );

}

document.getElementById("allBtn").onclick = () => {

    showFavorites = false;

    loadLinks();

};



document.getElementById("favBtn").onclick = () => {

    showFavorites = true;

    loadLinks();

};

// Register Service Worker

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("service-worker.js")

            .then(() => {

                console.log("LinkVault App Ready");

            })

            .catch(error => {

                console.log("Service Worker Error", error);

            });

    });

}

// ===========================
// Splash Screen
// ===========================

window.addEventListener("load", () => {

    setTimeout(() => {

        const splash = document.getElementById("splash");

        splash.classList.add("splash-hide");

        setTimeout(() => {

            splash.remove();

        }, 600);

    }, 2000);

});
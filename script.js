// =========================================================
// LINKVAULT 2.0 — CLEAN MASTER SCRIPT
// =========================================================

// =========================================================
// FIREBASE
// =========================================================

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================================================
// GLOBAL STATE
// =========================================================

let firebaseUID = null;
let showFavorites = false;
let currentSearch = "";
let editingFirestoreId = null;


// =========================================================
// DOM HELPERS
// =========================================================

const $ = (id) => document.getElementById(id);


// =========================================================
// MAIN ELEMENTS
// =========================================================

const popup = $("popup");
const editPopup = $("editPopup");

const linksContainer = $("linksContainer");

const saveBtn = $("saveBtn");
const updateBtn = $("updateBtn");

const closePopupBtn = $("closePopup");
const closeEditBtn = $("closeEdit");

const openPopupBtn = $("openPopup");


// =========================================================
// PRANK MODE
// =========================================================

async function checkPrankMode() {

    console.log("🚀 PRANK CHECK STARTED");

    const prankLoading = $("prankLoading");
    const prankOverlay = $("prankOverlay");
    const prankReveal = $("prankReveal");

    const upgradeBtn = $("upgradeBtn");
    const enterLinkVault = $("enterLinkVault");

    try {

        const configRef = doc(
            db,
            "system",
            "config"
        );

        const configSnapshot = await getDoc(
            configRef
        );

        let prankEnabled = false;

        if (configSnapshot.exists()) {

            const config = configSnapshot.data();

            prankEnabled =
                config.prankMode === true;

        }

        console.log(
            "🔥 Prank Mode:",
            prankEnabled
        );


        // -------------------------------------------------
        // PRANK ENABLED
        // -------------------------------------------------

        if (prankEnabled) {

            if (prankOverlay) {

                prankOverlay.style.display =
                    "flex";

            }

            document.body.style.overflow =
                "hidden";


            if (upgradeBtn) {

                upgradeBtn.onclick = () => {

                    if (prankOverlay) {

                        prankOverlay.style.display =
                            "none";

                    }

                    if (prankReveal) {

                        prankReveal.style.display =
                            "flex";

                    }

                };

            }


            if (enterLinkVault) {

                enterLinkVault.onclick = () => {

                    if (prankReveal) {

                        prankReveal.style.display =
                            "none";

                    }

                    document.body.style.overflow =
                        "";

                };

            }

        }

        // -------------------------------------------------
        // PRANK DISABLED
        // -------------------------------------------------

        else {

            if (prankOverlay) {

                prankOverlay.style.display =
                    "none";

            }

            if (prankReveal) {

                prankReveal.style.display =
                    "none";

            }

            document.body.style.overflow =
                "";

        }


        if (prankLoading) {

            prankLoading.style.display =
                "none";

        }

    }

    catch (error) {

        console.error(
            "❌ Prank Mode Error:",
            error
        );

        if (prankLoading) {

            prankLoading.style.display =
                "none";

        }

    }

}


// Start prank check

checkPrankMode();


// =========================================================
// LOCAL AUTH GUARD
// =========================================================

function checkLocalAccess() {

    const savedEmail =
        localStorage.getItem("userEmail");

    const savedPin =
        localStorage.getItem("userPin");

    const pinUnlocked =
        sessionStorage.getItem("pinUnlocked");


    console.log(
        "Current User:",
        savedEmail
    );


    // -----------------------------------------------------
    // NO ACCOUNT
    // -----------------------------------------------------

    if (!savedEmail) {

        window.location.href =
            "signup.html";

        return false;

    }


    // -----------------------------------------------------
    // NO PIN
    // -----------------------------------------------------

    if (!savedPin) {

        window.location.href =
            "setpin.html";

        return false;

    }


    // -----------------------------------------------------
    // PIN LOCKED
    // -----------------------------------------------------

    if (pinUnlocked !== "true") {

        window.location.href =
            "pin.html";

        return false;

    }


    return true;

}


// Run access check

const hasLocalAccess =
    checkLocalAccess();


// =========================================================
// FIREBASE AUTH
// =========================================================

if (hasLocalAccess) {

    auth.onAuthStateChanged(
        (user) => {

            if (user) {

                firebaseUID =
                    user.uid;

                console.log(
                    "🔥 AUTH USER:",
                    user.email
                );

                console.log(
                    "🔥 AUTH UID:",
                    firebaseUID
                );


                updateSidebarProfile(
                    user
                );

                updateProfileMenu(
                    user
                );

                loadLinks();

            }

            else {

                firebaseUID =
                    null;

                console.warn(
                    "⚠️ No Firebase Auth user"
                );

            }

        }
    );

}


// =========================================================
// PROFILE INFORMATION
// =========================================================

function updateSidebarProfile(user) {

    const nameElement =
        $("sidebarUserName");

    const emailElement =
        $("sidebarUserEmail");


    const localName =
        localStorage.getItem("userName");


    if (nameElement) {

        nameElement.textContent =
            user.displayName ||
            localName ||
            "LinkVault User";

    }


    if (emailElement) {

        emailElement.textContent =
            user.email ||
            localStorage.getItem("userEmail") ||
            "Account";

    }

}


// =========================================================
// PROFILE DROPDOWN
// =========================================================

const profileButton =
    $("profileButton");

const profileDropdown =
    $("profileDropdown");


if (
    profileButton &&
    profileDropdown
) {

    profileButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            profileDropdown.classList.toggle(
                "open"
            );

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !profileDropdown.contains(
                    event.target
                ) &&
                !profileButton.contains(
                    event.target
                )
            ) {

                profileDropdown.classList.remove(
                    "open"
                );

            }

        }
    );

}


// =========================================================
// PROFILE MENU DATA
// =========================================================

function updateProfileMenu(user = null) {

    const email =
        user?.email ||
        localStorage.getItem(
            "userEmail"
        ) ||
        "Account";


    const name =
        user?.displayName ||
        localStorage.getItem(
            "userName"
        ) ||
        "User";


    const nameElement =
        $("profileMenuName");

    const emailElement =
        $("profileMenuEmail");


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (emailElement) {

        emailElement.textContent =
            email;

    }

}


// Run once immediately

updateProfileMenu();


// =========================================================
// TOP PROFILE BUTTON
// =========================================================

const profileTopBtn =
    $("profileTopBtn");


if (profileTopBtn) {

    profileTopBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile.html";

        }
    );

}


// =========================================================
// PROFILE MENU BUTTONS
// =========================================================

const profileToggleBtn =
    $("profileToggleBtn");

const profileBtn =
    $("profileBtn");

const editProfileBtn =
    $("editProfileBtn");

const privateSpaceBtn =
    $("privateSpaceBtn");


const profileSettingsBtn =
    $("profileSettingsBtn");

const profileLogoutBtn =
    $("profileLogoutBtn");


// ---------------------------------------------------------
// MY PROFILE
// ---------------------------------------------------------

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile.html";

        }
    );

}


// ---------------------------------------------------------
// EDIT PROFILE
// ---------------------------------------------------------

if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile.html";

        }
    );

}


// ---------------------------------------------------------
// PRIVATE SPACE
// ---------------------------------------------------------

if (privateSpaceBtn) {

    privateSpaceBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "private-pin.html";

        }
    );

}


// ---------------------------------------------------------
// PROFILE SETTINGS
// ---------------------------------------------------------

if (profileSettingsBtn) {

    profileSettingsBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html";

        }
    );

}


// ---------------------------------------------------------
// PROFILE LOGOUT
// ---------------------------------------------------------

if (profileLogoutBtn) {

    profileLogoutBtn.addEventListener(
        "click",
        () => {

            logoutUser();

        }
    );

}


// =========================================================
// ADD LINK POPUP
// =========================================================

if (openPopupBtn) {

    openPopupBtn.addEventListener(
        "click",
        () => {

            if (popup) {

                popup.style.display =
                    "flex";

            }

        }
    );

}


// =========================================================
// CLOSE ADD POPUP
// =========================================================

if (closePopupBtn) {

    closePopupBtn.addEventListener(
        "click",
        () => {

            closeAddPopup();

        }
    );

}


function closeAddPopup() {

    if (popup) {

        popup.style.display =
            "none";

    }

}


// =========================================================
// SAVE LINK
// =========================================================

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        saveLink
    );

}


async function saveLink() {

    console.log(
        "💾 Save button clicked"
    );


    const name =
        $("linkName")?.value.trim();

    const url =
        $("linkURL")?.value.trim();

    const note =
        $("linkNote")?.value.trim();

    const category =
        $("category")?.value ||
        "Personal";

    const favorite =
        $("favorite")?.checked === true;


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!name || !url) {

        alert(
            "Please enter a link name and URL."
        );

        return;

    }


    if (!firebaseUID) {

        alert(
            "Firebase account is not ready. Please wait a moment and try again."
        );

        return;

    }


    // -----------------------------------------------------
    // URL VALIDATION
    // -----------------------------------------------------

    let finalURL = url;

    if (
        !finalURL.startsWith("http://") &&
        !finalURL.startsWith("https://")
    ) {

        finalURL =
            "https://" +
            finalURL;

    }


    // -----------------------------------------------------
    // LINK OBJECT
    // -----------------------------------------------------

    const newLink = {

        id: Date.now(),

        name: name,

        url: finalURL,

        note: note || "",

        category: category,

        favorite: favorite,

        date:
            new Date().toLocaleDateString(),

        createdAt:
            Date.now()

    };


    try {

        await addDoc(
            collection(
                db,
                "users",
                firebaseUID,
                "links"
            ),
            newLink
        );


        console.log(
            "✅ Saved to Firebase"
        );


        // -------------------------------------------------
        // CLEAR FORM
        // -------------------------------------------------

        if ($("linkName")) {

            $("linkName").value = "";

        }

        if ($("linkURL")) {

            $("linkURL").value = "";

        }

        if ($("linkNote")) {

            $("linkNote").value = "";

        }

        if ($("favorite")) {

            $("favorite").checked =
                false;

        }


        closeAddPopup();


        await loadLinks(
            currentSearch
        );


    }

    catch (error) {

        console.error(
            "❌ Firebase Save Error:",
            error
        );

        alert(
            "Firebase Error: " +
            error.message
        );

    }

}


// =========================================================
// WEBSITE ICON
// =========================================================

function getWebsiteIcon(url = "") {

    const lowerURL =
        url.toLowerCase();


    if (
        lowerURL.includes(
            "instagram"
        )
    ) {

        return "📸";

    }


    if (
        lowerURL.includes(
            "youtube"
        ) ||
        lowerURL.includes(
            "youtu.be"
        )
    ) {

        return "▶️";

    }


    if (
        lowerURL.includes(
            "amazon"
        )
    ) {

        return "🛒";

    }


    if (
        lowerURL.includes(
            "flipkart"
        )
    ) {

        return "🛍️";

    }


    if (
        lowerURL.includes(
            "github"
        )
    ) {

        return "💻";

    }


    if (
        lowerURL.includes(
            "linkedin"
        )
    ) {

        return "💼";

    }


    if (
        lowerURL.includes(
            "facebook"
        )
    ) {

        return "📘";

    }


    if (
        lowerURL.includes(
            "twitter"
        ) ||
        lowerURL.includes(
            "x.com"
        )
    ) {

        return "𝕏";

    }


    return "🔗";

}


// =========================================================
// LOAD LINKS
// =========================================================

async function loadLinks(
    searchText = currentSearch
) {

    if (!linksContainer) {

        return;

    }


    if (!firebaseUID) {

        console.warn(
            "⚠️ Firebase UID not available yet."
        );

        return;

    }


    currentSearch =
        searchText || "";


    console.log(
        "📥 Loading links..."
    );


    let links = [];


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    firebaseUID,
                    "links"
                )
            );


        snapshot.forEach(
            (firebaseDocument) => {

                links.push({

                    ...firebaseDocument.data(),

                    firestoreId:
                        firebaseDocument.id

                });

            }
        );


        console.log(
            "📦 Firebase documents:",
            links.length
        );

    }

    catch (error) {

        console.error(
            "❌ Loading Error:",
            error
        );


        linksContainer.innerHTML = `
            <p style="
                text-align:center;
                opacity:.7;
                padding:30px;
            ">
                Unable to load links.
            </p>
        `;

        return;

    }


    // =====================================================
    // STATISTICS
    // =====================================================

    updateStatistics(
        links
    );


    // =====================================================
    // FILTER
    // =====================================================

    const search =
        currentSearch
            .toLowerCase()
            .trim();


    const filteredLinks =
        links.filter(
            (link) => {

                const searchableText =
                    [
                        link.name,
                        link.url,
                        link.note,
                        link.category
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    searchableText.includes(
                        search
                    );


                const matchesFavorite =
                    showFavorites
                        ? link.favorite === true
                        : true;


                return (
                    matchesSearch &&
                    matchesFavorite
                );

            }
        );


    // =====================================================
    // RENDER
    // =====================================================

    renderLinks(
        filteredLinks
    );

}


// =========================================================
// STATISTICS
// =========================================================

function updateStatistics(
    links
) {

    const totalLinks =
        $("totalLinks");

    const favoriteCount =
        $("favoriteCount");

    const todayCount =
        $("todayCount");


    if (totalLinks) {

        totalLinks.textContent =
            links.length;

    }


    if (favoriteCount) {

        favoriteCount.textContent =
            links.filter(
                link =>
                    link.favorite === true
            ).length;

    }


    if (todayCount) {

        const today =
            new Date()
                .toLocaleDateString();


        todayCount.textContent =
            links.filter(
                link =>
                    link.date === today
            ).length;

    }

}


// =========================================================
// RENDER LINKS
// =========================================================

function renderLinks(
    links
) {

    linksContainer.innerHTML =
        "";


    if (!links.length) {

        linksContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:40px 20px;
                opacity:.7;
            ">
                <div style="
                    font-size:40px;
                    margin-bottom:10px;
                ">
                    🔗
                </div>

                <p>
                    ${showFavorites
                ? "No favorite links found."
                : currentSearch
                    ? "No matching links found."
                    : "No links saved yet."
            }
                </p>
            </div>
        `;

        return;

    }


    // Newest first

    links.sort(
        (a, b) =>
            Number(
                b.createdAt ||
                b.id ||
                0
            ) -
            Number(
                a.createdAt ||
                a.id ||
                0
            )
    );


    links.forEach(
        renderSingleLink
    );

}


// =========================================================
// RENDER SINGLE LINK
// =========================================================

function renderSingleLink(
    link
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "card";


    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        `${getWebsiteIcon(
            link.url
        )
        } ${link.favorite
            ? "⭐ "
            : ""
        }${link.name ||
        "Untitled"
        }`;


    card.appendChild(
        title
    );


    // -----------------------------------------------------
    // URL
    // -----------------------------------------------------

    const url =
        document.createElement(
            "p"
        );


    url.className =
        "url";


    url.textContent =
        link.url || "";


    card.appendChild(
        url
    );


    // -----------------------------------------------------
    // NOTE
    // -----------------------------------------------------

    if (link.note) {

        const note =
            document.createElement(
                "p"
            );


        note.className =
            "note";


        note.textContent =
            `📝 ${link.note}`;


        card.appendChild(
            note
        );

    }


    // -----------------------------------------------------
    // CARD INFO
    // -----------------------------------------------------

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "card-info";


    const badge =
        document.createElement(
            "span"
        );


    badge.className =
        "badge";


    badge.textContent =
        link.category ||
        "Personal";


    const date =
        document.createElement(
            "small"
        );


    date.textContent =
        `📅 ${link.date || ""
        }`;


    info.appendChild(
        badge
    );

    info.appendChild(
        date
    );


    card.appendChild(
        info
    );


    // -----------------------------------------------------
    // BUTTON CONTAINER
    // -----------------------------------------------------

    const buttons =
        document.createElement(
            "div"
        );


    buttons.className =
        "buttons";


    // -----------------------------------------------------
    // OPEN BUTTON
    // -----------------------------------------------------

    const openButton =
        document.createElement(
            "button"
        );


    openButton.textContent =
        "🌐 Open";


    openButton.addEventListener(
        "click",
        () => {

            if (link.url) {

                window.open(
                    link.url,
                    "_blank",
                    "noopener,noreferrer"
                );

            }

        }
    );


    // -----------------------------------------------------
    // DELETE BUTTON
    // -----------------------------------------------------

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "🗑 Delete";

    deleteButton.addEventListener("click", () => {

        deleteLink(link.firestoreId);

    });


    // -----------------------------------------------------
    // FAVORITE BUTTON
    // -----------------------------------------------------

    const favoriteButton =
        document.createElement(
            "button"
        );


    favoriteButton.textContent =
        link.favorite
            ? "⭐"
            : "☆";


    favoriteButton.title =
        link.favorite
            ? "Remove favorite"
            : "Add favorite";


    favoriteButton.addEventListener(
        "click",
        () => {

            toggleFavorite(
                link.firestoreId
            );

        }
    );


    // -----------------------------------------------------
    // EDIT BUTTON
    // -----------------------------------------------------

    const editButton =
        document.createElement(
            "button"
        );


    editButton.textContent =
        "✏️ Edit";


    editButton.addEventListener(
        "click",
        () => {

            openEditPopup(
                link.firestoreId
            );

        }
    );


    buttons.appendChild(
        openButton
    );

    buttons.appendChild(
        deleteButton
    );

    buttons.appendChild(
        favoriteButton
    );

    buttons.appendChild(
        editButton
    );


    card.appendChild(
        buttons
    );


    linksContainer.appendChild(
        card
    );

}


// =========================================================
// DELETE LINK
// =========================================================

async function deleteLink(
    firestoreId
) {

    if (!firebaseUID) {

        alert(
            "Firebase account is not ready."
        );

        return;

    }


    if (!firestoreId) {

        return;

    }


    const confirmed =
        confirm(
            "Delete this link?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                firebaseUID,
                "links",
                firestoreId
            )
        );


        console.log(
            "🗑 Deleted from Firebase"
        );


        await loadLinks(
            currentSearch
        );

    }

    catch (error) {

        console.error(
            "❌ Delete Error:",
            error
        );


        alert(
            "Delete Error: " +
            error.message
        );

    }

}


// =========================================================
// TOGGLE FAVORITE
// =========================================================

async function toggleFavorite(
    firestoreId
) {

    if (!firebaseUID) {

        return;

    }


    if (!firestoreId) {

        return;

    }


    try {

        const linkRef =
            doc(
                db,
                "users",
                firebaseUID,
                "links",
                firestoreId
            );


        const snapshot =
            await getDoc(
                linkRef
            );


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.data();


        await updateDoc(
            linkRef,
            {

                favorite:
                    data.favorite !== true

            }
        );


        console.log(
            "⭐ Favorite Updated"
        );


        await loadLinks(
            currentSearch
        );

    }

    catch (error) {

        console.error(
            "❌ Favorite Error:",
            error
        );

    }

}


// =========================================================
// EDIT POPUP
// =========================================================

async function openEditPopup(
    firestoreId
) {

    if (!firebaseUID) {

        return;

    }


    if (!firestoreId) {

        return;

    }


    try {

        const linkRef =
            doc(
                db,
                "users",
                firebaseUID,
                "links",
                firestoreId
            );


        const snapshot =
            await getDoc(
                linkRef
            );


        if (!snapshot.exists()) {

            alert(
                "Link not found."
            );

            return;

        }


        const data =
            snapshot.data();


        editingFirestoreId =
            firestoreId;


        // -------------------------------------------------
        // FILL EDIT FORM
        // -------------------------------------------------

        if ($("editName")) {

            $("editName").value =
                data.name || "";

        }


        if ($("editURL")) {

            $("editURL").value =
                data.url || "";

        }


        if ($("editCategory")) {

            $("editCategory").value =
                data.category ||
                "Personal";

        }


        // -------------------------------------------------
        // SHOW POPUP
        // -------------------------------------------------

        if (editPopup) {

            editPopup.style.display =
                "flex";

        }

    }

    catch (error) {

        console.error(
            "❌ Edit Open Error:",
            error
        );

    }

}


// =========================================================
// UPDATE LINK
// =========================================================

if (updateBtn) {

    updateBtn.addEventListener(
        "click",
        updateLink
    );

}


async function updateLink() {

    if (!firebaseUID) {

        return;

    }


    if (!editingFirestoreId) {

        return;

    }


    const name =
        $("editName")?.value.trim();

    const url =
        $("editURL")?.value.trim();

    const category =
        $("editCategory")?.value ||
        "Personal";


    if (!name || !url) {

        alert(
            "Please fill all fields."
        );

        return;

    }


    let finalURL =
        url;


    if (
        !finalURL.startsWith(
            "http://"
        ) &&
        !finalURL.startsWith(
            "https://"
        )
    ) {

        finalURL =
            "https://" +
            finalURL;

    }


    try {

        const linkRef =
            doc(
                db,
                "users",
                firebaseUID,
                "links",
                editingFirestoreId
            );


        await updateDoc(
            linkRef,
            {

                name:
                    name,

                url:
                    finalURL,

                category:
                    category

            }
        );


        console.log(
            "✏️ Link Updated"
        );


        closeEditPopup();


        editingFirestoreId =
            null;


        await loadLinks(
            currentSearch
        );

    }

    catch (error) {

        console.error(
            "❌ Update Error:",
            error
        );


        alert(
            "Update Error: " +
            error.message
        );

    }

}


// =========================================================
// CLOSE EDIT POPUP
// =========================================================

if (closeEditBtn) {

    closeEditBtn.addEventListener(
        "click",
        closeEditPopup
    );

}


function closeEditPopup() {

    if (editPopup) {

        editPopup.style.display =
            "none";

    }


    editingFirestoreId =
        null;

}


// =========================================================
// SEARCH
// =========================================================

const searchInput =
    $("search");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                searchInput.value;


            loadLinks(
                currentSearch
            );

        }
    );

}


// =========================================================
// ALL LINKS
// =========================================================

const allBtn =
    $("allBtn");


if (allBtn) {

    allBtn.addEventListener(
        "click",
        () => {

            showFavorites =
                false;


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            setActiveSidebarItem(
                "homeBtn"
            );


            loadLinks();

        }
    );

}


// =========================================================
// FAVORITES FLOATING BUTTON
// =========================================================

const favBtn =
    $("favBtn");


if (favBtn) {

    favBtn.addEventListener(
        "click",
        () => {

            showFavorites =
                true;


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            setActiveSidebarItem(
                "navFav"
            );


            loadLinks();

        }
    );

}


// =========================================================
// SIDEBAR
// =========================================================

const sidebar =
    $("sidebar");

const mobileMenuBtn =
    $("mobileMenuBtn");

const sidebarBackdrop =
    $("sidebarBackdrop");


function openSidebar() {

    if (!sidebar) {

        return;

    }


    sidebar.classList.add(
        "mobile-open"
    );


    if (sidebarBackdrop) {

        sidebarBackdrop.classList.add(
            "active"
        );

    }

}


function closeSidebar() {

    if (!sidebar) {

        return;

    }


    sidebar.classList.remove(
        "mobile-open"
    );


    if (sidebarBackdrop) {

        sidebarBackdrop.classList.remove(
            "active"
        );

    }

}


if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            if (
                sidebar?.classList.contains(
                    "mobile-open"
                )
            ) {

                closeSidebar();

            }

            else {

                openSidebar();

            }

        }
    );

}


if (sidebarBackdrop) {

    sidebarBackdrop.addEventListener(
        "click",
        closeSidebar
    );

}


// =========================================================
// SIDEBAR ACTIVE STATE
// =========================================================

function setActiveSidebarItem(
    id
) {

    document
        .querySelectorAll(
            ".sidebar-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    const target =
        $(id);


    if (target) {

        target.classList.add(
            "active"
        );

    }

}


// =========================================================
// HOME
// =========================================================

const homeBtn =
    $("homeBtn");


if (homeBtn) {

    homeBtn.addEventListener(
        "click",
        () => {

            showFavorites =
                false;


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            setActiveSidebarItem(
                "homeBtn"
            );


            loadLinks();


            closeSidebar();

        }
    );

}


// =========================================================
// FAVORITES SIDEBAR
// =========================================================

const navFav =
    $("navFav");


if (navFav) {

    navFav.addEventListener(
        "click",
        () => {

            showFavorites =
                true;


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            setActiveSidebarItem(
                "navFav"
            );


            loadLinks();


            closeSidebar();

        }
    );

}


// =========================================================
// CATEGORY FILTERS
// =========================================================

document
    .querySelectorAll(
        ".category-card"
    )
    .forEach(
        (categoryButton) => {

            categoryButton.addEventListener(
                "click",
                () => {

                    const categoryText =
                        categoryButton
                            .querySelector(
                                "strong"
                            )
                            ?.textContent
                            .trim();


                    if (!categoryText) {

                        return;

                    }


                    filterByCategory(
                        categoryText
                    );

                }
            );

        }
    );


async function filterByCategory(
    category
) {

    if (!firebaseUID) {

        return;

    }


    showFavorites =
        false;


    currentSearch =
        "";


    if (searchInput) {

        searchInput.value =
            "";

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    firebaseUID,
                    "links"
                )
            );


        const links = [];


        snapshot.forEach(
            (firebaseDocument) => {

                links.push({

                    ...firebaseDocument.data(),

                    firestoreId:
                        firebaseDocument.id

                });

            }
        );


        const filtered =
            links.filter(
                link =>
                    String(
                        link.category ||
                        ""
                    ).toLowerCase() ===
                    category.toLowerCase()
            );


        updateStatistics(
            links
        );


        renderLinks(
            filtered
        );
        // Smoothly scroll to the links section
        setTimeout(() => {
            const linksSection = document.getElementById("linksContainer");

            if (linksSection) {
                linksSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 100);

    }

    catch (error) {

        console.error(
            "❌ Category Error:",
            error
        );

    }

}


// =========================================================
// SETTINGS
// =========================================================

const settingsBtn =
    $("settingsBtn");


if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

const logoutBtn =
    $("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutUser
    );

}


async function logoutUser() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await auth.signOut();

    }

    catch (error) {

        console.error(
            "Firebase logout error:",
            error
        );

    }


    // Clear local session

    sessionStorage.removeItem(
        "pinUnlocked"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );


    window.location.href =
        "login.html";

}


// =========================================================
// SIDEBAR PRIVATE SPACE
// =========================================================

const sidebarItems =
    document.querySelectorAll(
        ".sidebar-menu .sidebar-item"
    );


sidebarItems.forEach(
    (item) => {

        item.addEventListener(
            "click",
            () => {

                const text =
                    item.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes(
                        "private space"
                    )
                ) {

                    window.location.href =
                        "private-pin.html";

                    return;

                }


                closeSidebar();

            }
        );

    }
);


// =========================================================
// CLOSE POPUPS WHEN CLICKING OUTSIDE
// =========================================================

if (popup) {

    popup.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                popup
            ) {

                closeAddPopup();

            }

        }
    );

}


if (editPopup) {

    editPopup.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                editPopup
            ) {

                closeEditPopup();

            }

        }
    );

}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeSidebar();

        closeAddPopup();

        closeEditPopup();


        if (profileDropdown) {

            profileDropdown.classList.remove(
                "open"
            );

        }

    }
);


// =========================================================
// SPLASH SCREEN
// =========================================================

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                const splash =
                    $("splash");


                if (!splash) {

                    return;

                }


                splash.classList.add(
                    "splash-hide"
                );


                setTimeout(
                    () => {

                        if (
                            splash &&
                            splash.parentNode
                        ) {

                            splash.remove();

                        }

                    },
                    700
                );

            },
            2000
        );

    }
);


// =========================================================
// SERVICE WORKER
// =========================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    () => {

                        console.log(
                            "✅ LinkVault Service Worker Registered"
                        );

                    }
                )
                .catch(
                    (error) => {

                        console.error(
                            "❌ Service Worker Error:",
                            error
                        );

                    }
                );

        }
    );

}


// =========================================================
// GLOBAL FUNCTIONS
// =========================================================

window.toggleFavorite =
    toggleFavorite;

window.deleteLink =
    deleteLink;

window.editLink =
    openEditPopup;


// =========================================================
// FINAL LOG
// =========================================================

console.log(
    "🚀 LinkVault 2.0 Script Loaded Successfully"
);

/* =========================================
   LINKVAULT GLOBAL THEME
========================================= */

function applyGlobalTheme() {

    const darkMode =
        localStorage.getItem(
            "linkvault_dark_mode"
        );

    if (darkMode === "false") {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );

    }

}


/* Apply theme immediately */

applyGlobalTheme();

/* =========================================================
   PRIVATE SPACE NAVIGATION
========================================================= */

const sidebarPrivateSpaceBtn =
    document.getElementById("sidebarPrivateSpaceBtn");

// const privateSpaceBtn =
//     document.getElementById("privateSpaceBtn");


if (sidebarPrivateSpaceBtn) {

    sidebarPrivateSpaceBtn.addEventListener("click", () => {

        window.location.href = "private-pin.html";

    });

}


// if (privateSpaceBtn) {

//     privateSpaceBtn.addEventListener("click", () => {

//         window.location.href = "private-space.html";

//     });

// }
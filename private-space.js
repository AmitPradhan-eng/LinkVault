// ==========================================
// LINKVAULT 2.0 — PRIVATE SPACE
// COMPLETE CLEAN VERSION
// ==========================================

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db, auth } from "./firebase.js";


// ==========================================
// STATE
// ==========================================

let privateLinks = [];
let editingPrivateId = null;


// ==========================================
// DOM ELEMENTS
// ==========================================
const privateBackBtn =
    document.getElementById("privateBackBtn");

const privateLockScreen =
    document.getElementById("privateLockScreen");

const privateContent =
    document.getElementById("privateContent");

const privateUnlockBtn =
    document.getElementById("privateUnlockBtn");

const privatePinError =
    document.getElementById("privatePinError");

const privatePinInputs =
    document.querySelectorAll(".private-pin");

const privateAddBtn =
    document.getElementById("privateAddBtn");

const privatePopup =
    document.getElementById("privatePopup");

const privateCloseBtn =
    document.getElementById("privateCloseBtn");

const privateSaveBtn =
    document.getElementById("privateSaveBtn");

const privateLinksContainer =
    document.getElementById("privateLinksContainer");

// ==========================================
// BACK TO DASHBOARD
// ==========================================

if (privateBackBtn) {

    privateBackBtn.addEventListener(
        "click",
        () => {

            window.location.href = "index.html";

        }
    );

}


// ==========================================
// EDIT POPUP ELEMENTS
// ==========================================

const privateEditPopup =
    document.getElementById("privateEditPopup");

const privateUpdateBtn =
    document.getElementById("privateUpdateBtn");

const privateEditCloseBtn =
    document.getElementById("privateEditCloseBtn");

const editPrivateLinkName =
    document.getElementById("editPrivateLinkName");

const editPrivateLinkURL =
    document.getElementById("editPrivateLinkURL");

const editPrivateLinkNote =
    document.getElementById("editPrivateLinkNote");


// ==========================================
// DEBUG
// ==========================================

console.log("🔐 Private Space module starting...");

console.log("privateEditPopup:", privateEditPopup);
console.log("privateUpdateBtn:", privateUpdateBtn);
console.log("privateEditCloseBtn:", privateEditCloseBtn);


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const user = auth.currentUser;

    if (!user) {

        console.warn(
            "🔐 Private Space: Firebase user not ready."
        );

        return null;
    }

    return user;
}


// ==========================================
// PRIVATE FIRESTORE COLLECTION
// ==========================================

function privateCollection() {

    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return collection(
        db,
        "users",
        user.uid,
        "privateLinks"
    );
}


// ==========================================
// LOAD PRIVATE LINKS
// ==========================================

export async function loadPrivateLinks() {

    const user = getCurrentUser();

    if (!user) {

        console.warn(
            "🔐 Cannot load private links: user unavailable."
        );

        privateLinks = [];

        return [];
    }


    try {

        const collectionRef =
            collection(
                db,
                "users",
                user.uid,
                "privateLinks"
            );


        const snapshot =
            await getDocs(collectionRef);


        const loadedLinks = [];


        snapshot.forEach(item => {

            loadedLinks.push({

                id: item.id,

                ...item.data()

            });

        });


        privateLinks =
            loadedLinks;


        console.log(
            "🔐 Private links loaded:",
            privateLinks.length
        );


        return privateLinks;

    }

    catch (error) {

        console.error(
            "❌ Private links loading error:",
            error
        );

        privateLinks = [];

        return [];

    }

}


// ==========================================
// SAVE PRIVATE LINK
// ==========================================

export async function savePrivateLink(data) {

    const user =
        getCurrentUser();


    if (!user) {

        throw new Error(
            "User is not authenticated."
        );

    }


    try {

        const collectionRef =
            collection(
                db,
                "users",
                user.uid,
                "privateLinks"
            );


        const privateLink = {

            name:
                data.name || "Untitled",

            url:
                data.url || "",

            note:
                data.note || "",

            category:
                data.category || "Personal",

            favorite:
                Boolean(data.favorite),

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        const docRef =
            await addDoc(
                collectionRef,
                privateLink
            );


        console.log(
            "🔐 Private link saved:",
            docRef.id
        );


        return {

            id:
                docRef.id,

            ...privateLink

        };

    }

    catch (error) {

        console.error(
            "❌ Private save error:",
            error
        );

        throw error;

    }

}


// ==========================================
// DELETE PRIVATE LINK
// ==========================================

export async function deletePrivateLink(id) {

    const user =
        getCurrentUser();


    if (!user || !id) {

        throw new Error(
            "User or link ID missing."
        );

    }


    try {

        const linkRef =
            doc(
                db,
                "users",
                user.uid,
                "privateLinks",
                id
            );


        await deleteDoc(linkRef);


        privateLinks =
            privateLinks.filter(
                link => link.id !== id
            );


        console.log(
            "🗑 Private link deleted:",
            id
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Private delete error:",
            error
        );

        throw error;

    }

}


// ==========================================
// UPDATE PRIVATE LINK
// ==========================================

export async function updatePrivateLink(
    id,
    data
) {

    const user =
        getCurrentUser();


    if (!user || !id) {

        throw new Error(
            "User or link ID missing."
        );

    }


    try {

        const linkRef =
            doc(
                db,
                "users",
                user.uid,
                "privateLinks",
                id
            );


        const updatedData = {

            name:
                data.name || "Untitled",

            url:
                data.url || "",

            note:
                data.note || "",

            category:
                data.category || "Personal",

            favorite:
                Boolean(data.favorite),

            updatedAt:
                serverTimestamp()

        };


        await updateDoc(
            linkRef,
            updatedData
        );


        const index =
            privateLinks.findIndex(
                link => link.id === id
            );


        if (index !== -1) {

            privateLinks[index] = {

                ...privateLinks[index],

                ...updatedData,

                updatedAt:
                    privateLinks[index].updatedAt

            };

        }


        console.log(
            "✏️ Private link updated:",
            id
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Private update error:",
            error
        );

        throw error;

    }

}


// ==========================================
// SEARCH PRIVATE LINKS
// ==========================================

export function searchPrivateLinks(
    query = ""
) {

    const search =
        query
            .trim()
            .toLowerCase();


    if (!search) {

        return [
            ...privateLinks
        ];

    }


    return privateLinks.filter(
        link => {

            return (

                (link.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (link.url || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (link.category || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (link.note || "")
                    .toLowerCase()
                    .includes(search)

            );

        }
    );

}


// ==========================================
// FAVORITES
// ==========================================

export function getPrivateFavorites() {

    return privateLinks.filter(
        link =>
            link.favorite === true
    );

}


// ==========================================
// CATEGORY
// ==========================================

export function getPrivateByCategory(
    category
) {

    if (!category) {

        return [
            ...privateLinks
        ];

    }


    return privateLinks.filter(
        link =>
            (link.category || "")
                .toLowerCase() ===
            category.toLowerCase()
    );

}


// ==========================================
// STATS
// ==========================================

export function getPrivateStats() {

    const today =
        new Date().toDateString();


    const todayLinks =
        privateLinks.filter(
            link => {

                if (!link.createdAt) {
                    return false;
                }


                let date;


                if (
                    typeof link.createdAt.toDate ===
                    "function"
                ) {

                    date =
                        link.createdAt.toDate();

                }

                else {

                    date =
                        new Date(
                            link.createdAt
                        );

                }


                return (
                    date.toDateString() ===
                    today
                );

            }
        );


    return {

        total:
            privateLinks.length,

        favorites:
            privateLinks.filter(
                link => link.favorite
            ).length,

        today:
            todayLinks.length

    };

}


// ==========================================
// GET PRIVATE LINKS
// ==========================================

export function getPrivateLinks() {

    return [
        ...privateLinks
    ];

}


// ==========================================
// PRIVATE LOCK
// ==========================================

function showPrivateLock() {

    if (privateLockScreen) {

        privateLockScreen.style.display =
            "flex";

    }


    if (privateContent) {

        privateContent.style.display =
            "none";

    }

}


// ==========================================
// UNLOCK PRIVATE SPACE
// ==========================================

function unlockPrivateSpace() {

    if (privateLockScreen) {

        privateLockScreen.style.display =
            "none";

    }


    if (privateContent) {

        privateContent.style.display =
            "block";

    }


    sessionStorage.setItem(
        "privatePinUnlocked",
        "true"
    );


    console.log(
        "🔓 Private Space unlocked"
    );

}


// ==========================================
// INITIAL LOCK STATE
// ==========================================

if (
    sessionStorage.getItem(
        "privatePinUnlocked"
    ) === "true"
) {

    unlockPrivateSpace();

}

else {

    showPrivateLock();

}


// ==========================================
// PIN INPUT HANDLING
// ==========================================

privatePinInputs.forEach(
    (input, index) => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value.replace(
                        /\D/g,
                        ""
                    );


                if (
                    input.value &&
                    index <
                    privatePinInputs.length - 1
                ) {

                    privatePinInputs[
                        index + 1
                    ].focus();

                }

            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Backspace" &&
                    !input.value &&
                    index > 0
                ) {

                    privatePinInputs[
                        index - 1
                    ].focus();

                }

            }
        );

    }
);


// ==========================================
// GET ENTERED PIN
// ==========================================

function getEnteredPrivatePin() {

    return Array
        .from(privatePinInputs)
        .map(
            input => input.value
        )
        .join("");

}


// ==========================================
// CLEAR PIN
// ==========================================

function clearPrivatePin() {

    privatePinInputs.forEach(
        input => {

            input.value = "";

        }
    );


    if (privatePinInputs[0]) {

        privatePinInputs[0].focus();

    }

}


// ==========================================
// PIN ERROR
// ==========================================

function showPrivateError(
    message
) {

    if (privatePinError) {

        privatePinError.textContent =
            message;

    }

}


// ==========================================
// VERIFY PRIVATE PIN
// ==========================================

async function verifyPrivatePin() {

    const user =
        auth.currentUser;


    if (!user) {

        showPrivateError(
            "Please login to your LinkVault account."
        );

        return;

    }


    const enteredPin =
        getEnteredPrivatePin();


    if (
        !/^\d{4}$/.test(
            enteredPin
        )
    ) {

        showPrivateError(
            "Please enter your 4-digit PIN."
        );

        return;

    }


    try {

        if (privateUnlockBtn) {

            privateUnlockBtn.disabled =
                true;

            privateUnlockBtn.textContent =
                "🔐 Verifying...";

        }


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            showPrivateError(
                "Account data not found."
            );

            return;

        }


        const userData =
            userSnapshot.data();


        const savedPin =
            userData.privatePin;


        if (!savedPin) {

            showPrivateError(
                "Private Space PIN is not configured."
            );

            return;

        }


        if (
            String(savedPin) ===
            String(enteredPin)
        ) {

            unlockPrivateSpace();

            clearPrivatePin();


            if (privatePinError) {

                privatePinError.textContent =
                    "";

            }


            await loadPrivateLinks();

            renderPrivateLinks();

        }

        else {

            showPrivateError(
                "❌ Wrong PIN. Please try again."
            );

            clearPrivatePin();

        }

    }

    catch (error) {

        console.error(
            "❌ Private PIN error:",
            error
        );


        showPrivateError(
            "Unable to verify PIN. Please try again."
        );

    }

    finally {

        if (privateUnlockBtn) {

            privateUnlockBtn.disabled =
                false;

            privateUnlockBtn.textContent =
                "🔓 Unlock Private Space";

        }

    }

}


// ==========================================
// UNLOCK BUTTON
// ==========================================

if (privateUnlockBtn) {

    privateUnlockBtn.addEventListener(
        "click",
        verifyPrivatePin
    );

}


// ==========================================
// ENTER KEY
// ==========================================

privatePinInputs.forEach(
    input => {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    verifyPrivatePin();

                }

            }
        );

    }
);


// ==========================================
// ADD PRIVATE POPUP
// ==========================================

function openPrivateAddPopup() {

    if (!privatePopup) {
        return;
    }


    privatePopup.style.display =
        "flex";


    const nameInput =
        document.getElementById(
            "privateLinkName"
        );


    if (nameInput) {

        nameInput.focus();

    }

}


if (privateAddBtn) {

    privateAddBtn.addEventListener(
        "click",
        openPrivateAddPopup
    );

}


// ==========================================
// CLOSE ADD POPUP
// ==========================================

function closePrivatePopup() {

    if (!privatePopup) {
        return;
    }


    privatePopup.style.display =
        "none";

}


if (privateCloseBtn) {

    privateCloseBtn.addEventListener(
        "click",
        closePrivatePopup
    );

}


if (privatePopup) {

    privatePopup.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                privatePopup
            ) {

                closePrivatePopup();

            }

        }
    );

}


// ==========================================
// SAVE NEW PRIVATE LINK
// ==========================================

if (privateSaveBtn) {

    privateSaveBtn.addEventListener(
        "click",
        async () => {

            const nameInput =
                document.getElementById(
                    "privateLinkName"
                );

            const urlInput =
                document.getElementById(
                    "privateLinkURL"
                );

            const noteInput =
                document.getElementById(
                    "privateLinkNote"
                );


            const name =
                nameInput?.value.trim() || "";

            const url =
                urlInput?.value.trim() || "";

            const note =
                noteInput?.value.trim() || "";


            if (!name || !url) {

                alert(
                    "Please enter Link Name and URL."
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

                privateSaveBtn.disabled =
                    true;

                privateSaveBtn.textContent =
                    "🔐 Saving...";


                await savePrivateLink({

                    name:
                        name,

                    url:
                        finalURL,

                    note:
                        note

                });


                if (nameInput) {
                    nameInput.value = "";
                }

                if (urlInput) {
                    urlInput.value = "";
                }

                if (noteInput) {
                    noteInput.value = "";
                }


                closePrivatePopup();


                // IMPORTANT:
                // Reload ONLY privateLinks
                await loadPrivateLinks();

                renderPrivateLinks();


                console.log(
                    "✅ New private link displayed"
                );

            }

            catch (error) {

                console.error(
                    "❌ Save private link error:",
                    error
                );


                alert(
                    "Unable to save private link: " +
                    error.message
                );

            }

            finally {

                privateSaveBtn.disabled =
                    false;

                privateSaveBtn.textContent =
                    "🔒 Save Private Link";

            }

        }
    );

}


// ==========================================
// OPEN EDIT POPUP
// ==========================================

function openPrivateEditPopup(link) {

    if (!link) {

        console.error(
            "❌ No private link received."
        );

        return;

    }


    console.log(
        "✏️ Editing private link:",
        link.id
    );


    if (!privateEditPopup) {

        console.error(
            "❌ privateEditPopup not found."
        );

        return;

    }


    editingPrivateId =
        link.id;


    if (editPrivateLinkName) {

        editPrivateLinkName.value =
            link.name || "";

    }


    if (editPrivateLinkURL) {

        editPrivateLinkURL.value =
            link.url || "";

    }


    if (editPrivateLinkNote) {

        editPrivateLinkNote.value =
            link.note || "";

    }


    privateEditPopup.style.display =
        "flex";


    console.log(
        "✅ Edit popup opened"
    );

}


// ==========================================
// CLOSE EDIT POPUP
// ==========================================

function closePrivateEditPopup() {

    console.log(
        "❌ Closing edit popup"
    );


    if (privateEditPopup) {

        privateEditPopup.style.display =
            "none";

    }


    editingPrivateId =
        null;

}


// ==========================================
// EDIT CANCEL BUTTON
// ==========================================

if (privateEditCloseBtn) {

    privateEditCloseBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closePrivateEditPopup();

        }
    );

}


// ==========================================
// EDIT POPUP OUTSIDE CLICK
// ==========================================

if (privateEditPopup) {

    privateEditPopup.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                privateEditPopup
            ) {

                closePrivateEditPopup();

            }

        }
    );

}


// ==========================================
// UPDATE PRIVATE LINK
// ==========================================

if (privateUpdateBtn) {

    privateUpdateBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            if (!editingPrivateId) {

                alert(
                    "No private link selected."
                );

                return;

            }


            const name =
                editPrivateLinkName?.value.trim() || "";

            const url =
                editPrivateLinkURL?.value.trim() || "";

            const note =
                editPrivateLinkNote?.value.trim() || "";


            if (!name || !url) {

                alert(
                    "Please enter Link Name and URL."
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


            const idToUpdate =
                editingPrivateId;


            try {

                privateUpdateBtn.disabled =
                    true;

                privateUpdateBtn.textContent =
                    "💾 Updating...";


                await updatePrivateLink(
                    idToUpdate,
                    {

                        name:
                            name,

                        url:
                            finalURL,

                        note:
                            note

                    }
                );


                console.log(
                    "✅ Private link updated successfully:",
                    idToUpdate
                );


                closePrivateEditPopup();


                // Reload private collection
                await loadPrivateLinks();


                // Render updated collection
                renderPrivateLinks();


            }

            catch (error) {

                console.error(
                    "❌ Private update error:",
                    error
                );


                alert(
                    "Unable to update private link: " +
                    error.message
                );

            }

            finally {

                privateUpdateBtn.disabled =
                    false;

                privateUpdateBtn.textContent =
                    "💾 Update Private Link";

            }

        }
    );

}


// ==========================================
// RENDER PRIVATE LINKS
// ==========================================

function renderPrivateLinks() {

    if (!privateLinksContainer) {

        console.error(
            "❌ privateLinksContainer not found."
        );

        return;

    }


    console.log(
        "🎨 Rendering private links:",
        privateLinks.length
    );


    // ======================================
    // EMPTY STATE
    // ======================================

    if (!privateLinks.length) {

        privateLinksContainer.innerHTML = `

            <div class="private-empty">

                <div>
                    🔒
                </div>

                <h3>
                    No Private Links Yet
                </h3>

                <p>
                    Links you save here will remain
                    separate from your normal collection.
                </p>

            </div>

        `;

        return;

    }


    // ======================================
    // CLEAR OLD PRIVATE CARDS
    // ======================================

    privateLinksContainer.innerHTML =
        "";


    // ======================================
    // CREATE CARDS
    // ======================================

    privateLinks.forEach(
        link => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "private-link-card";


            const safeName =
                escapePrivateHTML(
                    link.name ||
                    "Untitled"
                );


            const safeURL =
                escapePrivateHTML(
                    link.url ||
                    ""
                );


            const safeNote =
                escapePrivateHTML(
                    link.note ||
                    ""
                );


            card.innerHTML = `

                <div class="private-link-info">

                    <h3>
                        🔐 ${safeName}
                    </h3>

                    <p>
                        ${safeURL}
                    </p>

                    ${
                        safeNote
                            ? `
                                <small>
                                    📝 ${safeNote}
                                </small>
                            `
                            : ""
                    }

                </div>


                <div class="private-link-actions">

                    <button
                        class="private-open-btn"
                        type="button"
                    >
                        🌐 Open
                    </button>


                    <button
                        class="private-edit-btn"
                        type="button"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        class="private-delete-btn"
                        type="button"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            // ==================================
            // OPEN BUTTON
            // ==================================

            const openBtn =
                card.querySelector(
                    ".private-open-btn"
                );


            if (openBtn) {

                openBtn.addEventListener(
                    "click",
                    () => {

                        if (!link.url) {
                            return;
                        }


                        window.open(
                            link.url,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }
                );

            }


            // ==================================
            // EDIT BUTTON
            // ==================================

            const editBtn =
                card.querySelector(
                    ".private-edit-btn"
                );


            if (editBtn) {

                editBtn.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        console.log(
                            "✏️ Edit clicked:",
                            link.id
                        );


                        openPrivateEditPopup(
                            link
                        );

                    }
                );

            }


            // ==================================
            // DELETE BUTTON
            // ==================================

            const deleteBtn =
                card.querySelector(
                    ".private-delete-btn"
                );


            if (deleteBtn) {

                deleteBtn.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const confirmed =
                            confirm(
                                "Delete this private link?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        try {

                            await deletePrivateLink(
                                link.id
                            );


                            renderPrivateLinks();


                            console.log(
                                "✅ Private link deleted"
                            );

                        }

                        catch (error) {

                            console.error(
                                "❌ Delete error:",
                                error
                            );


                            alert(
                                "Unable to delete private link."
                            );

                        }

                    }
                );

            }


            privateLinksContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapePrivateHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// INITIALIZE PRIVATE SPACE
// ==========================================

async function initializePrivateSpace(
    user
) {

    if (!user) {

        console.warn(
            "🔐 Private Space: No Firebase user."
        );

        return;

    }


    console.log(
        "🔐 Initializing Private Space for:",
        user.uid
    );


    // ======================================
    // LOCKED
    // ======================================

    if (
        sessionStorage.getItem(
            "privatePinUnlocked"
        ) !== "true"
    ) {

        showPrivateLock();

        return;

    }


    // ======================================
    // UNLOCKED
    // ======================================

    unlockPrivateSpace();


    try {

        // IMPORTANT:
        // Only Firebase privateLinks collection
        // is loaded here.

        await loadPrivateLinks();


        renderPrivateLinks();


        console.log(
            "✅ Private Space initialized correctly"
        );

    }

    catch (error) {

        console.error(
            "❌ Private Space initialization error:",
            error
        );

    }

}


// ==========================================
// FIREBASE AUTH STATE
// ==========================================

auth.onAuthStateChanged(
    async user => {

        console.log(
            "🔥 Firebase auth state:",
            user
                ? user.uid
                : "No user"
        );


        if (!user) {

            showPrivateLock();

            return;

        }


        await initializePrivateSpace(
            user
        );

    }
);


// ==========================================
// FINAL READY
// ==========================================

console.log(
    "🔐 Private Space module loaded successfully"
);
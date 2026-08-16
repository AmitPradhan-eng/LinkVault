// ==========================================
// LINKVAULT 2.0 — PRIVATE SPACE
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
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const user = auth.currentUser;

    if (!user) {
        console.warn("Private Space: User not logged in");
        return null;
    }

    return user;
}


// ==========================================
// PRIVATE COLLECTION
// ==========================================

function privateCollection() {

    const user = getCurrentUser();

    if (!user) return null;

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

    const collectionRef = privateCollection();

    if (!collectionRef) return [];

    try {

        const snapshot = await getDocs(collectionRef);

        privateLinks = [];

        snapshot.forEach((item) => {

            privateLinks.push({
                id: item.id,
                ...item.data()
            });

        });

        console.log(
            "🔐 Private Space loaded:",
            privateLinks.length
        );

        return privateLinks;

    } catch (error) {

        console.error(
            "Private Space loading error:",
            error
        );

        return [];

    }
}


// ==========================================
// SAVE PRIVATE LINK
// ==========================================

export async function savePrivateLink(data) {

    const collectionRef = privateCollection();

    if (!collectionRef) {

        throw new Error(
            "User is not authenticated"
        );

    }

    try {

        const privateLink = {

            name: data.name || "Untitled",

            url: data.url || "",

            note: data.note || "",

            category: data.category || "Personal",

            favorite: Boolean(data.favorite),

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()

        };

        const docRef = await addDoc(
            collectionRef,
            privateLink
        );

        console.log(
            "🔐 Private link saved:",
            docRef.id
        );

        return {
            id: docRef.id,
            ...privateLink
        };

    } catch (error) {

        console.error(
            "Private Space save error:",
            error
        );

        throw error;

    }
}


// ==========================================
// DELETE PRIVATE LINK
// ==========================================

export async function deletePrivateLink(id) {

    const user = getCurrentUser();

    if (!user || !id) return;

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "privateLinks",
                id
            )
        );

        privateLinks =
            privateLinks.filter(
                link => link.id !== id
            );

        console.log(
            "🗑 Private link deleted:",
            id
        );

        return true;

    } catch (error) {

        console.error(
            "Private Space delete error:",
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

    const user = getCurrentUser();

    if (!user || !id) return;

    try {

        const linkRef = doc(
            db,
            "users",
            user.uid,
            "privateLinks",
            id
        );

        await updateDoc(
            linkRef,
            {

                name: data.name || "Untitled",

                url: data.url || "",

                note: data.note || "",

                category:
                    data.category || "Personal",

                favorite:
                    Boolean(data.favorite),

                updatedAt:
                    serverTimestamp()

            }
        );

        const index =
            privateLinks.findIndex(
                link => link.id === id
            );

        if (index !== -1) {

            privateLinks[index] = {

                ...privateLinks[index],

                ...data

            };

        }

        console.log(
            "✏️ Private link updated:",
            id
        );

        return true;

    } catch (error) {

        console.error(
            "Private Space update error:",
            error
        );

        throw error;

    }
}


// ==========================================
// SEARCH PRIVATE LINKS
// ==========================================

export function searchPrivateLinks(query = "") {

    const search =
        query.trim().toLowerCase();

    if (!search) {

        return [...privateLinks];

    }

    return privateLinks.filter(link => {

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

    });

}


// ==========================================
// FAVORITES
// ==========================================

export function getPrivateFavorites() {

    return privateLinks.filter(
        link => link.favorite === true
    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

export function getPrivateByCategory(
    category
) {

    if (!category) {

        return [...privateLinks];

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
        privateLinks.filter(link => {

            if (!link.createdAt) return false;

            let date;

            if (
                typeof link.createdAt.toDate ===
                "function"
            ) {

                date =
                    link.createdAt.toDate();

            } else {

                date =
                    new Date(link.createdAt);

            }

            return (
                date.toDateString() ===
                today
            );

        });

    return {

        total: privateLinks.length,

        favorites:
            privateLinks.filter(
                link => link.favorite
            ).length,

        today:
            todayLinks.length

    };

}


// ==========================================
// EXPORT STATE
// ==========================================

export function getPrivateLinks() {

    return [...privateLinks];

}


// ==========================================
// PRIVATE SPACE READY
// ==========================================

console.log(
    "🔐 Private Space module loaded"
);

// ==========================================
// PRIVATE SPACE PIN UNLOCK
// ==========================================

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


// ==========================================
// INITIAL STATE
// ==========================================

function showPrivateLock() {

    if (privateLockScreen) {
        privateLockScreen.style.display = "flex";
    }

    if (privateContent) {
        privateContent.style.display = "none";
    }

}


// ==========================================
// SHOW PRIVATE CONTENT
// ==========================================

function unlockPrivateSpace() {

    if (privateLockScreen) {
        privateLockScreen.style.display = "none";
    }

    if (privateContent) {
        privateContent.style.display = "block";
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
// CHECK EXISTING SESSION
// ==========================================

if (
    sessionStorage.getItem(
        "privatePinUnlocked"
    ) === "true"
) {

    unlockPrivateSpace();

} else {

    showPrivateLock();

}


// ==========================================
// AUTO MOVE BETWEEN PIN BOXES
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
            (event) => {

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

    return Array.from(
        privatePinInputs
    )
        .map(input => input.value)
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
// VERIFY PIN FROM FIREBASE
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


    if (!/^\d{4}$/.test(enteredPin)) {

        showPrivateError(
            "Please enter your 4-digit PIN."
        );

        return;

    }


    try {

        privateUnlockBtn.disabled =
            true;

        privateUnlockBtn.textContent =
            "🔐 Verifying...";


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        if (!userSnapshot.exists()) {

            showPrivateError(
                "Account data not found."
            );

            return;

        }


        const userData =
            userSnapshot.data();


        // ======================================
        // PIN STORED IN FIRESTORE
        // ======================================

        const savedPin =
            userData.privatePin;


        if (!savedPin) {

            showPrivateError(
                "Private Space PIN is not configured."
            );

            return;

        }


        // ======================================
        // VERIFY
        // ======================================

        if (
            String(savedPin) ===
            String(enteredPin)
        ) {

            unlockPrivateSpace();

            clearPrivatePin();

            privatePinError.textContent =
                "";

            await loadPrivateLinks();

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
            "❌ Private PIN verification error:",
            error
        );

        showPrivateError(
            "Unable to verify PIN. Please try again."
        );

    }

    finally {

        privateUnlockBtn.disabled =
            false;

        privateUnlockBtn.textContent =
            "🔓 Unlock Private Space";

    }

}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showPrivateError(message) {

    if (privatePinError) {

        privatePinError.textContent =
            message;

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
// PRIVATE SPACE UI
// ==========================================

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
// OPEN ADD PRIVATE LINK POPUP
// ==========================================

if (privateAddBtn) {

    privateAddBtn.addEventListener(
        "click",
        () => {

            if (!privatePopup) return;

            privatePopup.style.display = "flex";

            document
                .getElementById("privateLinkName")
                ?.focus();

        }
    );

}


// ==========================================
// CLOSE POPUP
// ==========================================

if (privateCloseBtn) {

    privateCloseBtn.addEventListener(
        "click",
        closePrivatePopup
    );

}


function closePrivatePopup() {

    if (privatePopup) {

        privatePopup.style.display =
            "none";

    }

}


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

if (privatePopup) {

    privatePopup.addEventListener(
        "click",
        (event) => {

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
// SAVE PRIVATE LINK BUTTON
// ==========================================

if (privateSaveBtn) {

    privateSaveBtn.addEventListener(
        "click",
        async () => {

            const name =
                document
                    .getElementById(
                        "privateLinkName"
                    )
                    ?.value
                    .trim();

            const url =
                document
                    .getElementById(
                        "privateLinkURL"
                    )
                    ?.value
                    .trim();

            const note =
                document
                    .getElementById(
                        "privateLinkNote"
                    )
                    ?.value
                    .trim();


            // ------------------------------
            // VALIDATION
            // ------------------------------

            if (!name || !url) {

                alert(
                    "Please enter Link Name and URL."
                );

                return;

            }


            let finalURL = url;


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


                console.log(
                    "✅ Private link saved"
                );


                // --------------------------
                // CLEAR FORM
                // --------------------------

                document
                    .getElementById(
                        "privateLinkName"
                    )
                    .value = "";

                document
                    .getElementById(
                        "privateLinkURL"
                    )
                    .value = "";

                document
                    .getElementById(
                        "privateLinkNote"
                    )
                    .value = "";


                closePrivatePopup();


                // --------------------------
                // RELOAD LINKS
                // --------------------------

                await loadPrivateLinks();

                renderPrivateLinks();


            } catch (error) {

                console.error(
                    "❌ Private link save error:",
                    error
                );

                alert(
                    "Unable to save private link: " +
                    error.message
                );

            } finally {

                privateSaveBtn.disabled =
                    false;

                privateSaveBtn.textContent =
                    "🔒 Save Private Link";

            }

        }
    );

}


// ==========================================
// RENDER PRIVATE LINKS
// ==========================================

function renderPrivateLinks() {

    if (!privateLinksContainer) {
        return;
    }


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


    privateLinksContainer.innerHTML = "";


    privateLinks.forEach(
        (link) => {

            const card =
                document.createElement("div");


            card.className =
                "private-link-card";


            card.innerHTML = `

                <div class="private-link-info">

                    <h3>
                        🔐 ${escapePrivateHTML(
                            link.name || "Untitled"
                        )}
                    </h3>

                    <p>
                        ${escapePrivateHTML(
                            link.url || ""
                        )}
                    </p>

                    ${
                        link.note
                            ? `
                                <small>
                                    📝 ${escapePrivateHTML(
                                        link.note
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>

                <div class="private-link-actions">

                    <button
                        class="private-open-btn"
                        data-url="${escapePrivateHTML(
                            link.url || ""
                        )}"
                    >
                        🌐 Open
                    </button>

                    <button
                        class="private-delete-btn"
                        data-id="${link.id}"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            // ------------------------------
            // OPEN
            // ------------------------------

            const openBtn =
                card.querySelector(
                    ".private-open-btn"
                );


            if (openBtn) {

                openBtn.addEventListener(
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

            }


            // ------------------------------
            // DELETE
            // ------------------------------

            const deleteBtn =
                card.querySelector(
                    ".private-delete-btn"
                );


            if (deleteBtn) {

                deleteBtn.addEventListener(
                    "click",
                    async () => {

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


                        } catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Unable to delete link."
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
// BASIC HTML ESCAPE
// ==========================================

function escapePrivateHTML(value) {

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
// LOAD + RENDER AFTER UNLOCK
// ==========================================

async function initializePrivateLinks() {

    if (
        sessionStorage.getItem(
            "privatePinUnlocked"
        ) !== "true"
    ) {

        return;

    }


    await loadPrivateLinks();

    renderPrivateLinks();

}


initializePrivateLinks();
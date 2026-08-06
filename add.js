const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {

    const name = document.getElementById("linkName").value.trim();
    const url = document.getElementById("linkURL").value.trim();

    if (name === "" || url === "") {
        alert("Please fill in both fields.");
        return;
    }

    // Get existing links
    let links = JSON.parse(localStorage.getItem("links")) || [];

    // Create new link object
    const newLink = {
        id: Date.now(),
        name: name,
        url: url,
        date: new Date().toLocaleString()
    };

    // Add new link
    links.push(newLink);

    // Save back to Local Storage
    localStorage.setItem("links", JSON.stringify(links));

    alert("✅ Link Saved Successfully!");

    // Clear input fields
    document.getElementById("linkName").value = "";
    document.getElementById("linkURL").value = "";
});
const container = document.getElementById("linksContainer");

let links = JSON.parse(localStorage.getItem("links")) || [];

if (links.length === 0) {
    container.innerHTML = "<p>No links saved yet.</p>";
} else {

    links.reverse().forEach(link => {

        container.innerHTML += `

        <div class="card">

            <h3>${link.name}</h3>

            <p>${link.date}</p>

            <div class="buttons">

                <button onclick="window.open('${link.url}','_blank')">
                    🌐 Open
                </button>

                <button onclick="deleteLink(${link.id})">
                    🗑 Delete
                </button>

            </div>

        </div>

        `;

    });

}

function deleteLink(id){

let links = JSON.parse(localStorage.getItem("links")) || [];

links = links.filter(link => link.id !== id);

localStorage.setItem("links",JSON.stringify(links));

location.reload();

}
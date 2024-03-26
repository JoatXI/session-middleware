async function checkLogin() {
    // ask the server whether the user is logged in (GET /login)
    // query the object returned by the server to see if the username is null or not null
    // if null, display login form
    // if not null, display search artist form
    try {
        const res = await fetch('/users/login');

        const userSessions = await res.json();
        if (userSessions.username == null) {
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('song-search').style.display = 'none';
            document.getElementById('logout').style.display = 'none';
        } else if (userSessions.username != null) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('song-search').style.display = 'flex';
            document.getElementById('logout').style.display = 'flex';
        }

    } catch (e) {
        alert(`Error occured: ${e}`);
    }
}

async function ajaxLogin(details) {
    try {
        const res = await fetch(`/users/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(details)
        });

        if (res.status == 401) {
            alert('Invalid login details');
        } else if (res.status == 200) {
            alert(`Logged in as ${details.username}`);
            document.getElementById("logout").style.display = "flex";
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('song-search').style.display = 'flex';
        }

    } catch (e) {
        alert(`An error occurred while logging in ${e}`);
    }
}

async function ajaxSearch(artistName) {
	try {
		const response = await fetch(`/songs/uknumberones/artist/${artistName}`);
		
		const songList = await response.json();
		
		// Looping through the array of JSON objects and add the results to 'results' <div>
		//let html = "";
		songList.forEach(song => {
			const node1 = document.createElement("p");
			const textNode = document.createTextNode(`${song.artist}, ${song.title}, Released: ${song.year}`);
			
			node1.appendChild(textNode);
			
			// creates the buy button
			const buttonElement = document.createElement("input");
			buttonElement.setAttribute("type", "button");
			buttonElement.setAttribute("value", "Buy");
			
			const textField = document.createElement("input");
			textField.setAttribute("id", `quantity${song.id}`);
			
			// Adding the new node to the <div id="results">
            document.getElementById("search-results").style.display = "flex";
			document.getElementById("search-results").appendChild(node1);
			
			node1.appendChild(textField);
			
			// creates a "buy" button event handler
			buttonElement.addEventListener('click', ajaxBuy.bind(this, song));
			
			document.getElementById("search-results").appendChild(buttonElement);
		});
	} catch (e) {
		alert(`Error occured: ${e}`);
	}
}

async function ajaxBuy(purchaseSong) {
	try {
		const totalQuantity ={
			quantity: document.getElementById(`quantity${purchaseSong.id}`).value
		}
		
		const response = await fetch(`/songs/uknumberones/${purchaseSong.id}/buy`, {
			method: 'POST',
			headers: {
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify(totalQuantity)
		});
		
		if(response.status == 401) {
			alert("User not logged in");
		} else if(response.status == 404) {
            alert("No song with that ID");
        } else {
			alert("Song bought successfully!");
		}
	} catch (e) {
		alert(`Error occured: ${e}`);
	}
}

async function ajaxLogout() {
    try {
        const res = await fetch(`/users/logout`, {
            method: 'POST'
        });

        if(res.status == 200) {
            alert("You have been logged out");
            document.getElementById("login-form").style.display = "block";
            document.getElementById("logout").style.display = "none";
            document.getElementById("song-search").style.display = "none";
            document.getElementById("search-results").style.display = "none";
        }

    } catch (e) {
        alert(`Error occured: ${e}`);
    }
}


document.getElementById('ajaxLogin').addEventListener('click', () => {
    const details = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }
    ajaxLogin(details);
});

// Allows the AJAX run when we click a Button
document.getElementById('ajaxSearch').addEventListener('click', ()=> {
    // Reads the artist name from the text field
    const song = document.getElementById('artistName').value;
    ajaxSearch(song);
});

document.getElementById('logoutButton').addEventListener('click', ()=> {
    ajaxLogout();
});

checkLogin();

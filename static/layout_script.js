// Javascript for layout

// Wait for everything to be loaded and then run this line of code
document.addEventListener("DOMContentLoaded", () => {
	// Check if the user is using a username else redirect to home
	// page to use one where he'll be requested to set one
	if (!localStorage.getItem("username")) {

		// Send user to login page
		if (location.href != location.protocol + "//" + document.domain + ":" + location.port + "/login") { // Prevents infinite reloading
			location.replace("/login");
		}

		// Controls what the login or logout link does
		document.querySelector("#login_logout_btn").innerHTML = "<a href='/login'>Login</a>";

		// Add the username to LocalStorage
		login_btn = () => {
			event.preventDefault();
			if (document.querySelector("#username").value.length > 0 && document.querySelector("#username").value.length < 13 ) {
				localStorage.setItem("username", document.querySelector("#username").value);
				// Check if the user has any last visited channels and direct them to it
				if (localStorage.getItem("last_channel_visited")) {
					location.replace(localStorage.getItem("last_channel_visited"));
				} else {
					location.replace("/c/General");
				}
			} else {
				document.querySelector("#username").style.borderColor = "red";
			}
		}

	} else {

		// Timeout variable for processing channel
		var process_channel_timeout;

		// Make sure user is not on the login page and send them back
		if (location.href == location.protocol + "//" + document.domain + ":" + location.port + "/login") { // Prevents infinite reloading
			// Check if the user has any last visited channels and direct them to it
			if (localStorage.getItem("last_channel_visited")) {
				alert("Returning to last visited channel...")
				location.replace(localStorage.getItem("last_channel_visited"));
			} else {
				alert("Sending to General")
				location.replace("/c/General");
			}
		}

		// Controls what the login or logout link does
		document.querySelector("#login_logout_btn").innerHTML = "<a href='#' onclick='logout_btn()'>Logout</a>";

		// Remove the username from LocalStorage
		logout_btn = () => {
			localStorage.removeItem("username");
			location.replace("/login");
		}

		// Show input field for new channel creation
		create_new_channel = () => {
			document.querySelector("#create_new_channel_field").innerHTML = "<form method='POST'> <input type='text' nane='new_channel_name' id='new_channel_name' class='form-control' minlength='1' placeholder='Enter channel name' maxlength='8'/> </form> <span id='btn_load'> <button onclick='create_channel()' type='submit' class='btn btn-success'>Create</button> <button onclick='cancel_create_channel()' class='btn btn-danger'>Cancel</button> </span>";
		}

		// Create new channel and also check if they can use the requested name
		create_channel = () => {
			event.preventDefault();
			clearInterval(process_channel_timeout);

			if (document.querySelector("#new_channel_name").value.length > 0 ) {
				document.querySelector("#btn_load").innerHTML = "<img id='loading_gif_style' style='width: 20%;' src='/static/loading_gif/Ellipsis-3s-200px.gif' alt='loading_gif'/>";
				process_channel_timeout = setTimeout(process_channel, 2000);
			} else {
				document.querySelector("#new_channel_name").style.borderColor = "red";
			}
		}
		process_channel = () => {

			let parameters = {
				new_channel_name: document.querySelector("#new_channel_name").value
			}
			
			// Sending request in POST to hide the name from the URL
			$.post(location.pathname + "/create_channel", parameters, (data) => {
				// Check if the channel was created successfully
				if (data.CREATE_STATUS == "GOOD") {
					// Disabling Create Channel button
					document.querySelector(".create_new_channel").disabled = true;
					
					document.querySelector("#create_new_channel_field").innerHTML = "<div class='alert alert-success' role='alert'> \
																						Channel successfully created! \
																						</div>";
					setTimeout(() => {
						// Clear the HTML element(PAGE) of new channel field creation
						document.querySelector("#create_new_channel_field").innerHTML = "";
						location.replace("/c/"+parameters["new_channel_name"]);
					}, 4000);
				
				} else if (data.CREATE_STATUS == "ALREADY")  {
					document.querySelector("#create_new_channel_field").innerHTML = "<div class='alert alert-primary' role='alert'> \
																						Channel already exist. \
																						</div>";
					setTimeout(() => {
						// Clear the HTML element(PAGE) of new channel field creation
						document.querySelector("#create_new_channel_field").innerHTML = "";
					}, 4000);

				} 
				else {
					document.querySelector("#create_new_channel_field").innerHTML = "<div class='alert alert-danger' role='alert'> \
																						Failed to create Channel! Please only use letters. \
																						</div>";
					setTimeout(() => {
						// Clear the HTML element(PAGE) of new channel field creation
						document.querySelector("#create_new_channel_field").innerHTML = "";
					}, 4000);

				}
			});
		}

		// Hide the create channel field
		cancel_create_channel = () => {
			event.preventDefault();
			document.querySelector("#create_new_channel_field").innerHTML = "";
		}

		// Establishing connection with server
		var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

		// Record the last channel the user was in
		localStorage.setItem("last_channel_visited", location.href)

		// Send the chat box to scroll automatically to the latest message
		var element = document.querySelector("html");
		element.scrollTop = element.scrollHeight;

		// Add the username to the HTML code of the page
		const username = localStorage.getItem("username");
		//document.querySelector("#username_1").innerHTML = username;

		// Send event
		socket.on("connect", () => {
			
			document.querySelector("#send_msg").onclick = () => {
				event.preventDefault();
				if (document.querySelector("#message_text").value.length > 0) {
					let parameters = {
						msg: document.querySelector("#message_text").value,
						username_1: localStorage.getItem("username"),
						channel_name: location.pathname
					}
					socket.emit("chatter", parameters);
					document.querySelector("#message_text").value = ""
				}
			};
		});

		// Listen for event
		const channel_name = location.pathname // Get channel name here
		socket.on(channel_name, data => {
			const chatter_card = document.createElement("div");

			chatter_card.innerHTML = "<div class='container'> \
												<div class='card card_box_chat'> \
													<label for='message_text_card'>@"+data.username_1+"</label> \
													<pre id='message_text_card' class='text-break card-text'>"+data.msg+"</pre> \
													<span class='time-left text-muted'>"+data.timestamp+"</span> \
												</div> \
											</div>";
			document.querySelector("#chatter_box").append(chatter_card);
			var element = document.querySelector("html");
			element.scrollTop = element.scrollHeight;
		});
		
	}
});
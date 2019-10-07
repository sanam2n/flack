// Javascript for index page

var refresh_timeout;

// Wait for the page to fully load
document.addEventListener("DOMContentLoaded", () => {

	let username = localStorage.getItem("username");
	if (!username) {
		document.querySelector("#available_chatter").innerHTML = "<div class='col'> \
																	<div class='log_box'> \
																		<h4>Welcome To Chatter</h4> \
																		<p>Please enter a username to be used.</p>\
																		<form action='/login' method='POST'> \
																			<input type='text' name='username' id='username' placeholder='Username' class='form-control' required> \
																			<button class='btn btn-dark' type='submit' onclick='login_button()'>Use</button> \
																		</form> \
																	</div> \
																</div>"
	} else {

		// Make sure this was the channel the user was still in
		if (location.href != localStorage.getItem("last_channel_visited")) {
			location.replace(localStorage.getItem("last_channel_visited"))
		}

		// Get username stored in local Storage
		document.querySelector("#username").innerHTML = localStorage.getItem("username");

		// If button to create new channel is pressed, display a input field
		document.querySelector("#create_channel").onclick = () => {
			
			document.querySelector("#create_channel_input_field").innerHTML = "<div> \
																				<label id='available_channel' for='input_field_channel'>New Channel</label> \
																				<input id='input_field_channel' maxlength='10' autofocus type='text' placeholder='New Channel Name (0-10 letters)' class='form-control'/> \
																				<button id='create_channel_button' onclick='create_channel_button()' class='btn btn-dark'>CREATE CHANNEL</button> \
																				<button onclick='cancel_btn()' class='btn btn-warning'>CANCEL</button>\
																			</div>"
		}

		// Get the Channels the user has visited
		if (!localStorage.getItem("channel_visited")) {
			document.querySelector("#channel_list_visited").innerHTML = "Non visited"
		} else {
			let HTML_channel_list_visited;
			let channel_visited = JSON.parse(localStorage.getItem("channel_visited")); // Get the channels visited from local storage
			for (var i = 0; i < channel_visited.length; i++) {
				if (!HTML_channel_list_visited) {
					HTML_channel_list_visited = "<div class='row card'> \
											<div> \
												<span class='col-sm'> \
													<a href='/channel_name/"+channel_visited[i]+"' id='channel_name'>"+channel_visited[i]+"</a> \
												</span> \
												<span class='float-right'> \
													<a href='/channel_name/"+channel_visited[i]+"'><button class='btn btn-dark channel_btn'>JOIN CHANNEL</button></a> \
												</span> \
											</div> \
										</div>";
				} else {
					HTML_channel_list_visited += "<div class='row card'> \
											<div> \
												<span class='col-sm'> \
													<a href='/channel_name/"+channel_visited[i]+"' id='channel_name'>"+channel_visited[i]+"</a> \
												</span> \
												<span class='float-right'> \
													<a href='/channel_name/"+channel_visited[i]+"'><button class='btn btn-dark channel_btn'>JOIN CHANNEL</button></a> \
												</span> \
											</div> \
										</div>";
				}
				let parameters = {
					new_channel_name: channel_visited[i]
				}
				// Sending request in POST to hide the name from the URL
				$.post("/create_channel", parameters, () => {
					// Do nothing here
				});
			};
			document.querySelector("#channel_list_visited").innerHTML = HTML_channel_list_visited;
		}
	}
});

// Time out for refreshing process to prevent overflow to the server
refresh_channels = () => {
	document.querySelector("#channel_list").innerHTML = "<img id='loading_gif_style' src='/static/loading_gif/Ellipsis-3s-200px.gif' alt='loading_gif'/>";
	clearInterval(refresh_timeout);
	refresh_timeout = setTimeout(refresh_channels_list, 2000);
}

// Refresh the list of available channels
refresh_channels_list = () => {
	$.getJSON("/refresh_channels", (data) => {
		let HTML_channel_list;
		for (i = 0; i < data.channel_list.length; i++) {
			if (!HTML_channel_list) {
				HTML_channel_list = "<div class='row card'> \
										<div> \
											<span class='col-sm'> \
												<a href='/channel_name/"+data.channel_list[i]+"' id='channel_name'>"+data.channel_list[i]+"</a> \
											</span> \
											<span class='float-right'> \
												<a href='/channel_name/"+data.channel_list[i]+"'><button class='btn btn-dark channel_btn'>JOIN CHANNEL</button></a> \
											</span> \
										</div> \
									</div>";
			} else {
				HTML_channel_list += "<div class='row card'> \
										<div> \
											<span class='col-sm'> \
												<a href='/channel_name/"+data.channel_list[i]+"' id='channel_name'>"+data.channel_list[i]+"</a> \
											</span> \
											<span class='float-right'> \
												<a href='/channel_name/"+data.channel_list[i]+"'><button class='btn btn-dark channel_btn'>JOIN CHANNEL</button></a> \
											</span> \
										</div> \
									</div>";
			}
		};
		document.querySelector("#channel_list").innerHTML = HTML_channel_list;
	});
}

// Create a new channel. Send the name to the server to store in a list there
create_channel_button = () => {
	if (document.querySelector("#input_field_channel").value.length > 0) {
		let parameters = {
			new_channel_name: document.querySelector("#input_field_channel").value
		}
		// Sending request in POST to hide the name from the URL
		$.post("/create_channel", parameters, (data) => {
			// Check if the channel was created successfully
			if (data.CREATE_STATUS == "GOOD") {
				document.querySelector("#create_channel_input_field").innerHTML = "<div class='alert alert-success' role='alert'> \
																					Channel successfully created! \
																					</div>";
				setTimeout(() => {
					// Clear the HTML element(PAGE) of new channel field creation
					document.querySelector("#create_channel_input_field").innerHTML = "";
				}, 4000);
			
			} else if (data.CREATE_STATUS == "ALREADY")  {
				document.querySelector("#create_channel_input_field").innerHTML = "<div class='alert alert-primary' role='alert'> \
																					Channel already exist. \
																					</div>";
				setTimeout(() => {
					// Clear the HTML element(PAGE) of new channel field creation
					document.querySelector("#create_channel_input_field").innerHTML = "";
				}, 4000);

			} 
			else {
				document.querySelector("#create_channel_input_field").innerHTML = "<div class='alert alert-danger' role='alert'> \
																					Failed to create Channel. \
																					</div>";
				setTimeout(() => {
					// Clear the HTML element(PAGE) of new channel field creation
					document.querySelector("#create_channel_input_field").innerHTML = "";
				}, 4000);

			}
		});
		
		// Cause a refresh of the available channel list
		refresh_channels();
	} else {
		document.querySelector("#input_field_channel").style.borderColor = "red"; // Set the border color to red
	}
}

// Clear the HTML element(PAGE) of new channel field creation
cancel_btn = () => {
	document.querySelector("#create_channel_input_field").innerHTML = "";
}

// Used to store user name
var username;
login_button = () => {
	username = document.querySelector("#username").value;
	localStorage.setItem("username", username);
	location.reload();
}

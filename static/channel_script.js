// Script for Channel page

// Check if the user is using a username else redirect to home
// page to use one where he'll be requested to set one
if (!localStorage.getItem("username")) {
	location.replace("/")
}

// Establishing connection with server
var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

// Wait for everything to be loaded and then run this line of code
document.addEventListener("DOMContentLoaded", () => {

	// Make sure this was the channel the user was still in
	if (location.href != localStorage.getItem("last_channel_visited")) {
		location.replace(localStorage.getItem("last_channel_visited"))
	}

	// Record the last channel the user was in
	localStorage.setItem("last_channel_visited", location.href)

	// Send the chat box to scroll automatically to the latest message
	var element = document.querySelector(".chat_box");
	element.scrollTop = element.scrollHeight;

	// Add the username to the HTML code of the page
	const username = localStorage.getItem("username");
	document.querySelector("#username_1").innerHTML = username;

	document.querySelector("#back_home").onclick = () => {
		localStorage.setItem("last_channel_visited", location.protocol + "//" + document.domain + ":" + location.port + "/")
	}

	// Get the channel the user is visiting and store it locally
	if (localStorage.getItem("channel_visited") && !localStorage.getItem("channel_visited").includes(document.querySelector("#channel_tag").innerHTML)) {
		let channel_visited = JSON.parse(localStorage.getItem("channel_visited"));
		channel_visited.push(document.querySelector("#channel_tag").innerHTML);
		localStorage.setItem("channel_visited", JSON.stringify(channel_visited));
	} else if (!localStorage.getItem("channel_visited")) {
		let channel_visited = []
		channel_visited.push(document.querySelector("#channel_tag").innerHTML);
		localStorage.setItem("channel_visited", JSON.stringify(channel_visited));
	}

	// Send event
	socket.on("connect", () => {
		
		document.querySelector("#send_msg").onclick = () => {
			event.preventDefault();
			if (document.querySelector("#message_text").value.length > 0) {
				let parameters = {
					msg: document.querySelector("#message_text").value,
					username_1: document.querySelector("#username_1").innerHTML,
					channel_name: document.querySelector("#channel_tag").innerHTML
				}
				socket.emit("chatter", parameters);
				document.querySelector("#message_text").value = ""
			}
		};
	});

	// Listen for event
	const channel_name = document.querySelector("#channel_tag").innerHTML // Get channel name here
	socket.on(channel_name, data => {
		const chatter_card = document.createElement("div");
		//chatter_log.innerHTML = data.timestamp+"@"+ data.username_1 + ": " + data.msg;
		chatter_card.innerHTML = "<div class='container'> \
											<div class='card'> \
												<label for='message_text_card'>@"+data.username_1+"</label> \
												<pre id='message_text_card' class='card-text'>"+data.msg+"</pre> \
												<span class='time-left text-muted'>"+data.timestamp+"</span> \
											</div> \
										</div>";
		document.querySelector("#chatter_box").append(chatter_card);
		var element = document.querySelector(".chat_box");
		element.scrollTop = element.scrollHeight;
	});
});

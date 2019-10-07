#!/usr/bin/python

import os
import time
import requests

from flask import Flask, request, render_template, redirect, flash, jsonify
from flask_socketio import SocketIO, emit

# Custom packet
from chat_bot import bot

app = Flask(__name__)
app.config["SECRET_KEY"] = "klhakhgkjdfhglfkmkw3kl4jh54l3jkb234kn"
socketio = SocketIO(app)

system_data = {"channel_names": ['General']}
channel_storage = []

# Prevent Caching so CSS changes can take immediate effect
@app.after_request
def after_request(response):
	response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	response.headers["Expire"] = 0
	response.headers["Pragma"] = "no-cache"
	response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
	return response


@app.route("/")
def index():
	"""Show chatters channels"""

	return redirect("/c/General")


@app.route("/c/<string:channel>", methods=["GET", "POST"])
def channel_name(channel):
	"""Load the apropriate channel page"""

	# Store the Data to send to the HTML code in this variable
	channel_stored_chat_HTML = None

	# Check if there is any chat logs in the variable dictionary list
	if channel_storage:

		# Temporary variable for checks
		channel_present = False
		channel_present_n = None

		# Check to see if any of the dictionary list matches the channel being accesssed
		for alpha in range(len(channel_storage)):
			if "/c/"+channel in channel_storage[alpha]:
				channel_present = True
				channel_present_n = alpha

		# If the channel chat log exist in the logs add the chat log to the variable
		if channel_present:
			# Check if the user is requesting to go to a channel else just send them to the General channel
			if channel:
				channel_stored_chat_HTML = channel_storage[channel_present_n]["/c/"+channel]
			else:
				channel_stored_chat_HTML = channel_storage[channel_present_n]["General"]

	return render_template("index.html", channel_name=channel,
										   channel_list=system_data["channel_names"],
										   channel_stored_chat_HTML=channel_stored_chat_HTML)


@app.route("/login", methods=["GET", "POST"])
def login():
	""" Login """

	return render_template("login.html")


@app.route("/logout")
def logout():
	""" Remove username from LocalStorage on Javascript and reload the page"""

	return redirect("/")


@app.route("/refresh_channels", methods=["GET", "POST"])
def refresh_channels():
	"""Get new channel list"""

	return jsonify({"channel_list": system_data["channel_names"]})


@app.route("/c/<string:channel>/create_channel", methods=["POST", "GET"])
def create_channel(channel):
	"""Create a new channel"""

	creation_status = None
	new_channel = str(request.form.get("new_channel_name"))

	if new_channel.isalpha():
		if new_channel not in system_data["channel_names"]:
			system_data["channel_names"].append(new_channel)
			creation_status = "GOOD"
		else:
			creation_status = "ALREADY"
	else:
		creation_status = "BAD_CHAR"

	return jsonify({"CREATE_STATUS": creation_status})


@socketio.on("chatter")
def message_sender(data):
	"""Receive messages and send to the appropriate channel"""

	# Get the current time from the server
	time_msg = time.localtime()
	time_msg = str(time_msg.tm_mday) +"/"+ str(time_msg.tm_mon) +"/"+ str(time_msg.tm_year) +"-"+ str(time_msg.tm_hour) +":"+ str(time_msg.tm_min)

	# Store the chat log on the server. If the server is restarted the log will be cleared
	if channel_storage:
		channel_in_storage = False
		for alpha in range(len(channel_storage)):
			if data["channel_name"] in channel_storage[alpha]:
				channel_in_storage = True
				channel_in_section = alpha
		
		if channel_in_storage:
			channel_storage[channel_in_section][data["channel_name"]].append([{"timestamp": time_msg,
																			   "username": data["username_1"],
																			   "message": data["msg"]}])

			# If the chat for a channel is logger then 100. Delete the oldest message and only keep 100 messages
			if len(channel_storage[channel_in_section][data["channel_name"]]) >= 101:
				len(channel_storage[channel_in_section][data["channel_name"]].pop(0))
		else:
			channel_storage.append({data["channel_name"]: [[{"timestamp": time_msg,
															 "username": data["username_1"],
															 "message": data["msg"]}]]})
	else:
		channel_storage.append({data["channel_name"]: [[{"timestamp": time_msg,
														 "username": data["username_1"],
														 "message": data["msg"]}]]})

	# Emit the message to the proper channel
	emit(data["channel_name"], {"timestamp": time_msg, "msg": data["msg"], "username_1": data["username_1"]}, broadcast=True)

	# Check if the BOT is being activated
	if len(data["msg"]) >= 4:
		if str(data["msg"][:4]).lower() == "@bot":
			bot(data)


if __name__ == "__main__":
	socketio.run(app)
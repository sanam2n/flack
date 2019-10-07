# My own custom reply bot

import time
import random

from flask_socketio import emit

def bot(data):
	""" A little reply bot """

	# Process the message to the BOT
	process_reply(data["channel_name"], data["username_1"], data["msg"])

	return "Wait..."

class process_reply:

	def __init__(self, channel, username, msg_r):
		if msg_r and channel and username:

			# Get the current time from the server
			time_msg = time.localtime()
			time_msg = str(time_msg.tm_mday) +"/"+ str(time_msg.tm_mon) +"/"+ str(time_msg.tm_year) +"-"+ str(time_msg.tm_hour) +":"+ str(time_msg.tm_min)

			if len(msg_r) > 4:

				# Get the command being used
				bot_command = msg_r.split(" ")[1]

				# Show the user available commands
				if bot_command == "-help":
					bot_reply = """This is the bot help line. \n"""+ \
								"""1. Use '-poetry' to say random poetry. \n"""+ \
								"""2. Use '-jokes' to tell you jokes. \n"""+ \
								"""3. Use '-ideas' to give an idea. \n"""+ \
								"""4. Use '-time' to show the time."""

				# Give a random poetry line
				elif bot_command == "-poetry":
					poetry_list = ["The Pleasurable And Living Duck \n A Poem by sana \n Whose duck is that? I think I know. \n Its owner is quite happy though. \n Full of joy like a vivid rainbow, \n I watch him laugh. I cry hello. \n He gives his duck a shake, \n And laughs until her belly aches. \n The only other sound's the break, \n Of distant waves and birds awake. \n \n The duck is pleasurable, living and deep, \n But he has promises to keep, \n After cake and lots of sleep. \n Sweet dreams come to him cheap. \n \n He rises from his gentle bed, \n With thoughts of kittens in his head, \n He eats his jam with lots of bread. \n Ready for the day ahead. \n \n With thanks to the poet, Robert Frost, for the underlying structure.",
								"The Pretty And Little Cat \nA Poem by sana \nWhose cat is that? I think I know. \nIts owner is quite happy though. \nFull of joy like a vivid rainbow, \nI watch him laugh. I cry hello. \n\nHe gives his cat a shake, \nAnd laughs until her belly aches.\nThe only other sound's the break,\nOf distant waves and birds awake.\n\nThe cat is pretty, little and deep,\nBut he has promises to keep,\nAfter cake and lots of sleep.\nSweet dreams come to him cheap.\n\nHe rises from his gentle bed,\nWith thoughts of kittens in his head,\nHe eats his jam with lots of bread.\nReady for the day ahead.\n\nWith thanks to the poet, Robert Frost, for the underlying structure.",
								"The Charming And Exciting Rabbit\nA Poem by sana\nWhose rabbit is that? I think I know.\nIts owner is quite happy though.\nFull of joy like a vivid rainbow,\nI watch her laugh. I cry hello.\n\nShe gives her rabbit a shake,\nAnd laughs until her belly aches.\nThe only other sound's the break,\nOf distant waves and birds awake.\n\nThe rabbit is charming, exciting and deep,\nBut she has promises to keep,\nAfter cake and lots of sleep.\nSweet dreams come to her cheap.\n\nShe rises from her gentle bed,\nWith thoughts of kittens in her head,\nShe eats her jam with lots of bread.\nReady for the day ahead.\n\nWith thanks to the poet, Robert Frost, for the underlying structure.",
								"The Bright And Creepy Squirrel\nA Poem by sana\nWhose squirrel is that? I think I know.\nIts owner is quite happy though.\nFull of joy like a vivid rainbow,\nI watch her laugh. I cry hello.\n\nShe gives her squirrel a shake,\nAnd laughs until her belly aches.\nThe only other sound's the break,\nOf distant waves and birds awake.\n\nThe squirrel is bright, creepy and deep,\nBut she has promises to keep,\nAfter cake and lots of sleep.\nSweet dreams come to her cheap.\n\nShe rises from her gentle bed,\nWith thoughts of kittens in her head,\nShe eats her jam with lots of bread.\nReady for the day ahead.\n\nWith thanks to the poet, Robert Frost, for the underlying structure."]
					bot_reply = random.choice(poetry_list) # Select a random item from the list
				
				# Give a random Joke line
				elif bot_command == "-jokes":
					joke_list = ["Knock! Knock!\n\nWho’s there?\n\nCandice.\n\nCandice who?\n\nCandice door open, or am I stuck out here?",
								"Knock! Knock!\n\nWho’s there?\n\nSays.\n\nSays who?\n\nSays me, that’s who!",
								"Knock! Knock!\n\nWho’s there?\n\nVoodoo.\n\nVoodoo who?\n\nVoodoo you think you are, asking all these questions?",
								"Knock, knock!\nWho’s there?\nWire.\nWire who?\n\nWire you always asking ‘who’s there’?",
								"Mom: How make chicken\nDaughter: What?\nMom: Where buy chicken\nDaughter: Mom, this isn’t Google.\nMom: Avocado"]
					bot_reply = random.choice(joke_list) # Select a random item from the list
				
				# Give a random idea
				elif bot_command == "-ideas":
					idea_list = ["No Ideas...",
								"Call the girl/boy you like and just say hey.",
								"Do sit ups.",
								"Drink water.",
								"Ask your friends to join the channel!"]
					bot_reply = random.choice(idea_list) # Select a random item from the list
				
				# Show the time
				elif bot_command == "-time":
					bot_reply = time_msg
				
				else:
					bot_reply = "INVALID request. Please use '-help' to find out the available requests."	
			else:
				bot_reply = "INVALID request. Please use '-help' to find out the available requests."

			# Emit the message to the proper channel
			emit(channel, {"timestamp": time_msg, "msg": bot_reply, "username_1": "BOT"}, broadcast=True)

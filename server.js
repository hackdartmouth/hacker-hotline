/*
	author: Kevin Guh
	date: 9/19/2015
	purpose: backend for Hacker Hotline to service incoming requests from hackathon participants and dispatch mentors
*/

var fs = require('fs');
var path = require('path');
var bodyparser = require('body-parser');
var express = require('express');
var config = require('./config.json');
app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyparser());

// twilio client
var twilioClient = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// firebase client
var Firebase = require('firebase');
var firebaseClient = new Firebase(config.FIREBASE_URL);
var firebaseRequests = firebaseClient.child('requests');
var firebaseMentors = firebaseClient.child('mentors');

// homepage
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'static/html/index.html'));
});

// register help request with Firebase
app.post('/submit-request', function(req, res){
	var entry = req.body;
	entry['timestamp'] = Date.now();
	firebaseRequests.push(entry);
	res.sendFile(path.join(__dirname, '/static/html/success.html'));
});

// if mentor indicates is available to help, send next request to them and pop request from database
// TODO: make this function respond to incoming Twilio text messages
app.get('/test', function(req, res){
	var currentMentor = config.mentors['mentor1'];
	firebaseRequests.orderByChild('timestamp').once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			for(var i = 0; i < currentMentor['expertise'].length; i++){
				var skill = currentMentor['expertise'][i];
				var currentRequest = childSnapshot.val();

				for(var j = 0; j < currentRequest['tags'].length; j++){
					var need = currentRequest['tags'][j];
					if(skill == need){
						// send message to mentor
						var formatString = '';
						formatString += 'name: ' + currentRequest['name'] + '\n';
						formatString += 'location: ' + currentRequest['location'] + '\n';
						formatString += 'problem description: ' + currentRequest['problem-description'] + '\n';
						twilioClient.sendMessage({
							'to' : currentMentor['number'],
							'from' : config.TWILIO_NUMBER,
							'body' : formatString
						}, function(err, responseData){
							// print to error log
						});

						// send message to participant; TODO: currentRequest['number'] is undefined, async javascript at fault?
						var confirmationMessage = '';
						confirmationMessage += currentMentor['name'];
						confirmationMessage += 'is on the way to help!';
						
						twilioClient.sendMessage({
							'to' : currentRequest['number'],
							'from' : config.TWILIO_NUMBER,
							'body' : confirmationMessage
						}, function(err, responseData){
							// print to error log
						});
						// TODO: why is node.js saying that the message is already sent?
						res.send(formatString);
						firebaseRequests.child(childSnapshot.key()).remove();
						return true;
					}
				}
			}
			// if no match found, help queue (for current mentor's expertise) is empty
			var emptyQueueMessage = 'Looks like everyone\'s all set for the moment!';
			twilioClient.sendMessage({
				'to' : currentMentor['number'],
				'from' : config.TWILIO_NUMBER,
				'body' : emptyQueueMessage
			}, function(err, responseData){
				// print to error log
			});
			res.send(emptyQueueMessage);
		});
	});
});

// run server on port 3000
var server = app.listen(3000);

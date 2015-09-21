/*
	author: Kevin Guh
	date: 9/19/2015
	purpose: backend for Hacker Hotline to service incoming requests from hackathon participants and dispatch mentors
*/

var fs = require('fs');
var path = require('path');
var http = require('http');
var bodyparser = require('body-parser');
var express = require('express');
var config = require('./config.json');
app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyparser());

// twilio client
var twilio = require('twilio');
var twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// firebase client
var Firebase = require('firebase');
var firebaseClient = new Firebase(config.FIREBASE_URL);
var firebaseRequests = firebaseClient.child('requests');
var firebaseMentors = firebaseClient.child('mentors');

// homepage
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '/static/html/index.html'));
});

// register help request with Firebase
app.post('/submit-request', function(req, res){
	var entry = req.body;
	entry['timestamp'] = Date.now();
	firebaseRequests.push(entry);
	res.sendFile(path.join(__dirname, '/static/html/success.html'));
});

// if mentor indicates is available to help, send next request to them and pop request from database
http.createServer(function(req, res){


}).listen(15476);
app.get('/mentor', function(req, res){
	var myTwimlResponse = new twilio.TwimlResponse();
	firebaseRequests.orderByChild('timestamp').once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			// currently hard-coded; eventually convert to a lookup in the mentors database for the corresponding mentor's data
			var currentMentor = config.mentors['mentor1'];
			var noMatch = true;
			for(var i = 0; i < currentMentor['expertise'].length; i++){
				var skill = currentMentor['expertise'][i];
				var currentRequest = childSnapshot.val();
				
				// if only a single tag, Firebase returns tags as a string rather than list, so convert to list	
				if(typeof currentRequest['tags'] === "string") currentRequest['tags'] = [currentRequest['tags']];

				for(var j = 0; j < currentRequest['tags'].length; j++){
					var need = currentRequest['tags'][j];
					if(skill == need){
						noMatch = false;
						// send message to mentor
						var formatString = '';
						formatString += 'name: ' + currentRequest['name'] + '\n';
						formatString += 'location: ' + currentRequest['location'] + '\n';
						formatString += 'problem description: ' + currentRequest['problem-description'] + '\n';
						twilioClient.sendMessage({
							'to' : currentMentor['phone'],
							'from' : config.TWILIO_NUMBER,
							'body' : formatString
						}, function(err, responseData){
							// print to error log
						});
						
						// send message to participant
						var confirmationMessage = '';
						confirmationMessage += currentMentor['name'];
						confirmationMessage += ' is on the way to help!';

						twilioClient.sendMessage({
							'to' : currentRequest['phone'],
							'from' : config.TWILIO_NUMBER,
							'body' : confirmationMessage
						}, function(err, responseData){
							// print to error log
						});

						firebaseRequests.child(childSnapshot.key()).remove();
						return true;
					}
				}
			}

			// if no match found, help queue (for current mentor's expertise set) is empty
			if(noMatch){
				var emptyQueueMessage = 'Looks like everyone\'s all set for the moment!';
				twilioClient.sendMessage({
					'to' : currentMentor['phone'],
					'from' : config.TWILIO_NUMBER,
					'body' : emptyQueueMessage
				}, function(err, responseData){
					// print to error log
				});
			}
		});
	});
});

// run server on port 3000
var server = app.listen(3000);

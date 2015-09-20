/*
	author: Kevin Guh
	date: 9/19/2015
	purpose: backend for Hacker Hotline to service incoming requests from hackathon participants and dispatch mentors
*/

/*
shitty hardcoded dictionary of mentors and their areas of expertise
*/
var mentors = {
	'mentor1' : {
		'name' : 'test',
		'number' : '+15556667777',
		'expertise' : ['#halp']
	},

	'mentor2' : {
		'name' : 'test2',
		'expertise' : ['#moarhalp']
	}
}

var TWILIO_NUMBER =  '+16203591047';
var fs = require('fs');
var path = require('path');
var bodyparser = require('body-parser');
var express = require('express');
app = express();

// TODO: WHY IS CSS STILL NOT LOADING
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyparser());

// twilio client
//var twilioClient = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

// firebase client
var Firebase = require('firebase');
var firebaseClient = new Firebase('https://brilliant-fire-6090.firebaseio.com/');
var firebaseRequests = firebaseClient.child('requests');
var firebaseMentors = firebaseClient.child('mentors');

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '/index.html'));
});

// register help request with Firebase
app.post('/submit-request', function(req, res){
	var entry = req.body;

	entry['timestamp'] = Date.now();
	firebaseRequests.push(entry);
	res.sendFile(path.join(__dirname + '/success.html'));
});

// if mentor indicates is available to help, send next request to them and pop request from database
// TODO: make this function respond to incoming Twilio text messages
app.get('/test', function(req, res){
	var currentMentor = mentors['mentor1'];
	firebaseRequests.orderByChild('timestamp').once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			for(var i = 0; i < currentMentor['expertise'].length; i++){
				var skill = currentMentor['expertise'][i];
				var currentRequest = childSnapshot.val();

				// temp code; tags are currently a string, should be a list
				currentRequest['tags'] = [currentRequest['tags']];

				for(var j = 0; j < currentRequest['tags'].length; j++){
					var need = currentRequest['tags'][j];
					if(skill == need){
						var formatString = '';
						formatString += 'name: ' + currentRequest['name'] + '\n';
						formatString += 'location: ' + currentRequest['location'] + '\n';
						formatString += 'problem description: ' + currentRequest['problem-description'] + '\n';

						
						// send message to mentor
/*						twilioClient.sendMessage({
							'to' : currentMentor['number'],
							'from' : TWILIO_NUMBER,
							'body' : formatString
						}, function(err, responseData){

						});

						var confirmationMessage = '';
						confirmationMessage += currentMentor['name'];
						confirmationMessage += 'is on the way to help!';

						// send message to participant
						twilioClient.sendMessage({
							'to' : currentRequest['number'];
							'from' : TWILIO_NUMBER,
							'body' : confirmationMessage
						}, function(err, responseData){

						);

*/						

						res.send(formatString);
						firebaseRequests.child(childSnapshot.key()).remove();
						return true;
					}
				}
			}
		});
	});
});

// run server on port 3000
var server = app.listen(3000);
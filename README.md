<h1>Hacker Hotline</h1>
<h6>Streamlining the hackathon mentorship process</h6>
<p>This app is meant to streamline the mentorship process by allowing hackathon participants
who need help to submit requests and subsequently dispatching available mentors to them.
makes use of the Twilio/Firebase APIs and node.js.</p>
<p>To use this app, you will have to create a config.json file with information for your Twilio and Firebase accounts;
see server.js variable names for what you should name each item in the config file.</p>
<h3>TODO:</h3>
<h6>absolutely necessary</h6>
<ul>
	<li>Form input validation</li>
	<li>Turn #hashtag input field into a list of items mentors can help with and have users choose from list?</li>
	<li>Modify text message handling function to respond to text messages</li>
	<li>Check mentor messages against phone numbers in database to select mentor</li>
	<li>Test robustness of app</li>
	<li>Store request #hashtags in Firebase as a list of tags</li>
	<li>Input mentor data (going into production)</li>
	<li>Deploy site (AWS, Azure)</li>
</ul>
<h6>good to have</h6>
<ul>
	<li>Non-hard-coded mentor database</li>
	<li>Ability for hackers to text in requests as well (bypassing web platform)</li>
	<li>Security features? (e.g. encrypt form submissions)</li>
	<li>log files for full help request history, errors, mentor responses and feedback</li>
</ul>

<h6>if you're bored...</h6>
<ul>
	<li>Improve UI</li>
	<li>Develop native mobile apps</li>
</ul>
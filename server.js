
var fs = require('fs');

var express = require('express');
var app = express();

var SECONDS = 1000;
var MINUTES = 60*SECONDS;
var HOURS = 60*MINUTES;
var DAYS = 24*HOURS;

// 10-second grace period for entering
var T_ENTER_GRACE = 10*SECONDS;

// 7-day grace period for membership expiration
var T_EXPIRE_GRACE = 7*DAYS;


// launch db
var db;

(function() {
	var sqlite3 = require('sqlite3').verbose();

	db = new sqlite3.Database('excursion');

	// make party_log table if not exist
	db.exec("create table if not exists party_log (m_id, last_seen)");
})();


// launch server
(function() {

	// register views
	app.set('views', __dirname + '/views');
	app.engine('html', require('ejs').renderFile);

	// accept json encoded post data
	app.use(express.json());
	app.use(express.urlencoded());


	// index
	app.get('/', function(i, o, n) {
		o.render('index.html');
	});


	// for server assets (js / css)
	app.use('/asset', express.static(__dirname+'/assets'));

	// for server resources
	app.use('/resource', express.static(__dirname+'/resources'));


	// user lookups
	app.use('/user', function(i, o, n) {

		// lookup user
		db.prepare("select user.* from rfid left join user on user.m_id=rfid.t_id where rfid.`table`='user' and rfid.rfid like ?")
		 .get(i.body.rfid, function(err, user) {

			// found a user
			if(user) {

				// lookup their last entrance
				db.prepare("select * from party_log where m_id=?")
				 .get(user.m_id, function(err, log) {

					// reference now timestamp
					var now = Date.now();

					// haven't seen this user before
					if(!log) {

						// log their entrance
						db.prepare("insert into party_log values(?, ?)")
						 .run(user.m_id, now);
					}
					else {

						// check time diff
						if((now-log.last_seen) > T_ENTER_GRACE) {
							user.last_seen = log.last_seen;
						}
					}

					// user is not active
					if(user.status != 'active') {
						if(user.status == 'expired') {
							user.reject = 'Membership expired long time ago';
						}
						else {
							user.reject = 'Membership permanently '+user.status;
						}
					}
					// user is a member (staff is good now!)
					else if(user.type == 'member') {

						var expiration = user.date_expires*1000;

						// reject expired membership
						if(expiration < (now-T_EXPIRE_GRACE)) {
							user.reject = 'Membership expired '+Math.ceil((now-expiration)/DAYS)+' days ago';
						}
					}

					// send user as response
					o.send(user);
				});
			}
			// no user
			else {
				o.send(false);
			}
		});
	});

})();


// in case we shutdown
process.on('exit', function() {
	app.close();
	try {
		db.close();
	} catch(e){}
})


// listen on socket
app.listen(6892);

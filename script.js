// Initializing the SC object as part of the Sound Cloud Javascript SDK
SC.initialize({
	//client_id: 'PUT_CLIENT_ID_HERE'				//	Need to place the Client ID tag (alphanumeric)
	client_id: '340f063c670272fac27cfa67bffcafc4',
	redirect_uri: 'http://external.codecademy.com/soundcloud.html'

});

$(document).ready(function(){
	
	//	Making Requests
	SC.get('/tracks', {genres: 'ambient'}, 
		function (tracks) {
			$(tracks).each(function (index, track) {
				$('#results').append($('<li></li>').html(track.title + ' - ' + track.genre));
		});
	});

	//	Authentication using the Javascript SDK for SoundCloud
	$('a.connect').click(function(e) {
		e.preventDefault();
		SC.connect(function() {
			SC.get('/me', function(me) {
				$('#username').html(me.username)
			});
		});
	});

	//	Fetching a sound to play for an Embedded Player Widget
	SC.get('/tracks/293', function(track) {
		$('#player').html(track.title)
	});

	//	Creating the Embedded Player Widget
	SC.get('/tracks/293', function(track) {
        SC.oEmbed(track.permalink_url, document.getElementById('player'));
    });

    //	Streaming Sounds using the stream method and SoundManager object
    SC.stream('/tracks/293', function(sound) {
    	$('#start').click(function(e) {				//	Event handler start that will start playing the song when button clicked
    		e.preventDefault();
    		sound.start();
    	});
    	$('#stop').click(function(e) {				//	Similar to start event handler but for stop.
    		e.preventDefault();
    		sound.stop();
    	});
    });

    //	Recording with Javascript
    $('#startRecording a').click(function(e) {
    	$('#startRecording').hide();					//	On clicking the start recording button you want to hide the start recording button
    	$('#stopRecording').show();						//	and show the stop record button
    	e.preventDefault();
    	SC.record({
    		progress: function(ms, avgPeak) {
    			updateTimer(ms);
    		}
    	});
    });

    $('#stopRecording a').click(function(e) {
    	e.preventDefault();
    	$('#stopRecording').hide();
    	$('#playBack').show();
    	$('#upload').show();
    	SC.recordStop();
    });

    //	Adding Playback functionality
    $('#playBack a').click(function(e) {
		e.preventDefault();
		updateTimer(0);
		SC.recordPlay({
			progress: function(ms) {
				updateTimer(ms);
			}
		});
	});

	//	This small function lets the user upload what he/she has recorded
	$('#upload a').click(function(e) {
		e.preventDefault();
		SC.connect({
			connected: function() {
				$('.status').html('Uploading...');
				SC.recordUpload({
					track: {
						title: 'My Recording',
						sharing: 'private'
					}
				}, function(track) {
					$('.status').html("Uploaded: <a href='" + track.permalink_url + "'>" + track.permalink_url + "</a>");
				});
			}
		});
	});

	//	Accessing Comments on tracks
	SC.get('/track/293/comments', function(comments){
        $.each(comments, function(i, comment) {
            $('#comments').append(
                $('<li></li>').html(comment.body)
            );
        });
    });

	//	Triggering Events with Comments
	SC.stream('/tracks/293', {
		autoPlay: true,
		ontimedcomments: function(comment) {	// callback function
			$('#comment').comment[0].body		
		} 
	});

	//	Posting Comments
	SC.stream('/tracks/70355723', {
        autoPlay: true
    }, function(sound) {
        window.sound = sound;
    });
    
    $('#comment_form').submit(function(e) {
        e.preventDefault();
        // Add your code here!
         SC.connect(function() {
            SC.post('/tracks/70355723/comments', {
                comment: {
                    body: $('#comment_body').val(),
                    timestamp: window.sound.position
                }
            }, function(comment) {
                $('#status').val('Your comment was posted!');
                $('#comment_body').val('');
            });
        });
    });

});			// end bracket for .ready(function())


//	Helper method for the UI

function updateTimer(ms) {
	// update the timer text. Used when we're recording
	$('.status').text(SC.Helper.millisecondsToHMS(ms));
};


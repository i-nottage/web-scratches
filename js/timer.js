ws.Timer = function(user_options) {

	this._options = {
		timer_settings : null,
		timer : null,
		timer_audio : null,
		repeat : false,
		start_now : true
	};

	ws.extend(this._options, user_options);

	this._timer_settings = this._options.timer_settings;
	this._timer = this._options.timer;
	this._timer_audio = this._options.timer_audio;

	this._minute_start; // the starting value
	this._second_start; // for minutes and seconds

	this._minutes_counter;
	this._seconds_counter;

	this._second_length = 1000;
	this._minute_length = this._second_length * 60;

	this._active_timer = null;

	this._init();
};

ws.Timer.prototype = {

	_init : function() {

		var self = this;

		$timer = $( this._timer );

		this._minutes_counter = $timer.children('span.minutes');
		this._seconds_counter = $timer.children('span.seconds');

		if (this._options.start_now) {
			this._ssTimerSettings();
			this._startCountdown();
		}
		else {
			// get start button
			$start_button = $( this._timer_settings ).children('button.start');

			// wait for button press
			$start_button.on('click', function(e) {

				// stop lameass form submission
				e.preventDefault();

				// in case settings have changed
				self._ssTimerSettings();

				// begin countdown
				self._startCountdown();
			});

			// get start button
			$stop_button = $( this._timer_settings ).children('button.stop');

			// wait for button press
			$stop_button.on('click', function(e) {

				// stop lameass form submission
				e.preventDefault();

				// begin countdown
				self._stopCountdown();
			});
		}
	},
	_ssTimerSettings : function() {

		// get minutes and seconds
		$timer_settings = $( this._timer_settings);
		this._minute_start = $timer_settings.children('input.minutes-input').val();
		this._second_start = $timer_settings.children('input.seconds-input').val();
	},
	_startCountdown : function() {

		var self = this;

		clearInterval(this._active_timer);

		// automatically reset the timer

		$minutes_counter = this._minutes_counter;
		$seconds_counter = this._seconds_counter;

		var minutes = this._minute_start;
		var seconds = this._second_start;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		// set the thing
		$minutes_counter.text( minutes );
		$seconds_counter.text( seconds );

		// begin the countdown!!!
		this._active_timer = setInterval(function() {

			// get minutes & seconds
			var minutes = $minutes_counter.text();
			var seconds = $seconds_counter.text();

			// end countdown if we're done
			if (minutes == 0 && seconds == 0) {

				self._playSound();

				// restart
				if (self._options.repeat) {
				  self._startCountdown();
				}
				else {
				  self._stopCountdown();
				}

				return true;
			}

			// decrement counters
			if (seconds == 0) {

				// reset seconds
				seconds = 59;

				// and decrement minutes
				minutes = minutes - 1;
			}
			else {
				seconds = seconds - 1;

				if (seconds < 10) {
				  seconds = '0' + seconds;
				}
			}

			$minutes_counter.text(minutes);
			$seconds_counter.text(seconds);

		}, this._second_length);
	},
	_stopCountdown : function() {
		clearInterval(this._active_timer);

		this._resetCountdown();
	},
	_resetCountdown : function() {

		// GONE
		$minutes_counter = this._minutes_counter;
		$seconds_counter = this._seconds_counter;

		var minutes = this._minute_start;
		var seconds = this._second_start;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		// set the thing
		$minutes_counter.text( minutes );
		$seconds_counter.text( seconds );
	},
	_playSound : function() {
		this._timer_audio.play();
	}
};

/*
$.fn.timer = function( callback ) {
	callback = callback || function() {};
	return this.each(function() {
		var $timer = $( this ),
			$minutesEl = $timer.find( '.minutes' ),
			$secondsEl = $timer.find( '.seconds' ),
			interval = 1000,
			timer = null,
			start = 60,
			minutesText = $minutesEl.text(),
			minutes = ( minutesText[0] == '0' ) ? minutesText[1] : minutesText[0],
			m = Number( minutes );
			
			timer = setInterval(function() {
				start--;
				if( start == 0 ) {
					start = 60;
					
					$secondsEl.text( '00' );
					
					m--;
					
					if( m == 0 ) {
						clearInterval( timer );
						$minutesEl.text( '00' );
						callback();
						
					}
				} else {
				
					if( start >= 10 ) {
				
						$secondsEl.text( start.toString() );
				
					} else {
				
						$secondsEl.text( '0' + start.toString() );
					
				
					}
					if( minutes.length == 2 ) {
						$minutesEl.text( m.toString() );
					} else {
						if( m == 1 ) {
							$minutesEl.text( '00' );	
						} else {
							$minutesEl.text( '0' + m.toString() );
						}
					}
				
				}
			
			}, interval);
	
	});

};

$(function() {
	$( '.timer' ).timer(function() {
		document.getElementById( 'timer-beep' ).play();
	});

});
*/

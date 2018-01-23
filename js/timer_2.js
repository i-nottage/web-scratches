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

	this._toggle;

	this._minute_start; // the starting value
	this._second_start; // for minutes and seconds

	this._minutes_counter;
	this._seconds_counter;

	this._second_length = 1000;
	this._minute_length = this._second_length * 60;

	this._active_timer = null;

	this._index = new ws.ElementMap( this._options.root );

	this._init();

	// STATE
	this._running = false;
};

ws.Timer.prototype = {

	_init : function() {

		var self = this;

		this._minutes_counter = this._index['minutes-input']; 
		this._seconds_counter = this._index['seconds-input'];

		$('.up-button').on('click', function (e) {
			e.preventDefault();
			self._incrementCounter(e.target);
		});

		$('.down-button').on('click', function (e) {
			e.preventDefault();
			self._decrementCounter(e.target);
		});

		$('.minutes-input').on('change', function (e) {
			e.preventDefault();
			var val = parseInt($( e.target ).val());

			if (val < 0 || isNaN(val)) {
				val = 0;
			}

			if (val < 10) {
				val = '0' + val;
			}

			$( e.target ).val(val);
		});

		$('.seconds-input').on('change', function (e) {
			e.preventDefault();
			var val = $( e.target ).val();

			if (val < 0 || isNaN(val)) {
				val = 0;
			}

			if (val < 10) {
				val = '0' + val;
			}

			$( e.target ).val(val);
		});

		if (this._options.start_now) {
			this._ssTimerSettings();
			this._startCountdown();
		}
		else {
			// get start button
			this._toggle = this._index['timer-toggle-switch'];

			// wait for button press
			$( this._toggle ).on('click', function(e) {

				if (!self._running) {

					// stop lameass form submission
					e.preventDefault();

					$( self._toggle ).addClass('running');

					// in case settings have changed
					self._ssTimerSettings();

					// begin countdown
					self._startCountdown();
					$( e.target ).text('Stop');
					self._running = true;

				}
				else {

					// stop lameass form submission
					e.preventDefault();

					$( self._toggle ).removeClass('running');

					// stop and reset 
					self._stopCountdown();
					self._resetCountdown();
					$( e.target ).text('Start');
					self._running = false;
				}
			});
		}
	},
	_ssTimerSettings : function() {

		// get minutes and seconds
		this._minute_start = $( this._index['minutes-input'] ).val();
		this._second_start =  $( this._index['seconds-input'] ).val();
	},
	_startCountdown : function() {

		var self = this;

		clearInterval(this._active_timer);

		$( 'button.timer-control-arrow' ).attr({ disabled: true });

		// automatically reset the timer

		$minutes_counter = $( this._minutes_counter );
		$seconds_counter = $( this._seconds_counter );

		var minutes = this._minute_start;
		var seconds = this._second_start;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		// set the thing
		$minutes_counter.val( minutes );
		$seconds_counter.val( seconds );

		// begin the countdown!!!
		this._active_timer = setInterval(function() {

			// get minutes & seconds
			var minutes = $( self._minutes_counter ).val();
			var seconds = $( self._seconds_counter ).val();

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

				if (minutes < 10) {
				  minutes = '0' + minutes;
				}
			}
			else {
				seconds = seconds - 1;

				if (seconds < 10) {
				  seconds = '0' + seconds;
				}
			}

			$( self._minutes_counter ).val(minutes);
			$( self._seconds_counter ).val(seconds);

		}, this._second_length);
	},
	_stopCountdown : function() {
		clearInterval(this._active_timer);
		$( 'button.timer-control-arrow' ).attr({ disabled: false });
		this._resetCountdown();
	},
	_resetCountdown : function() {

		// GONE
		$minutes_counter = $( this._minutes_counter );
		$seconds_counter = $( this._seconds_counter );

		var minutes = this._minute_start;
		var seconds = this._second_start;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		// set the thing
		$( this._minutes_counter ).val( minutes );
		$( this._seconds_counter ).val( seconds );
	},
	_playSound : function() {
		this._timer_audio.play();
	},
	_incrementCounter : function(target) {

		if ($( target ).hasClass('minute')) {
			var val = parseInt($( this._index['minutes-input'] ).val()) + 1;
			if (val < 10) { val = "0" + val; }
			$( this._index['minutes-input'] ).val(val);
		} else {
			var val = (parseInt( $( this._index['seconds-input'] ).val()) + 1) % 60;
			if (val < 10) { val = "0" + val; }
			$( this._index['seconds-input'] ).val(val);
		}
	},
	_decrementCounter : function(target) {

		if ($( target ).hasClass('minute')) {
			var val = parseInt($( this._index['minutes-input'] ).val()) - 1;
			if (val < 0) { val = 0; }
			if (val < 10) { val = "0" + val; }
			$( this._index['minutes-input'] ).val(val);
		} else {
			var val = (parseInt($( this._index['seconds-input'] ).val()) - 1) % 60;
			if (val < 0) { val = 0; }
			if (val < 10) { val = "0" + val; }
			$( this._index['seconds-input'] ).val(val);
		}
	}
};

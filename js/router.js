/*	Define global variables
---------------------------------------------------------------------- */
var offsetLeft;

/*	Setup our Backbone Router
---------------------------------------------------------------------- */
var Router = Backbone.Router.extend({
	routes: {
		'': 'landing',
		'home': 'home',
		'period/:period': 'period',
		'period/:period/:offset': 'offset',
		'event/:slug': 'event'
	},

	landing: function () {
		routerFlag = false; // This disables other routing
	},

	home: function () {
		routerFlag = false; // This disables other routing
		$('div.intro').hide();
		setSEO('Home | The Biblical Timeline', 'From the creation of the world to the last-day events of Revelation, the timeline is a comprehensive guide to major Bible events, characters, and prophecies.');
	},

	period: function (period) {
		switch (period) {
			case 'first-generation':
				offsetLeft = period_offsets[0][0];
				break;
			case 'noah-and-the-flood':
				offsetLeft = period_offsets[1][0];
				break;
			case 'the-patriarchs':
				offsetLeft = period_offsets[2][0];
				break;
			case 'egypt-to-canaan':
				offsetLeft = period_offsets[3][0];
				break;
			case 'the-judges':
				offsetLeft = period_offsets[4][0];
				break;
			case 'united-kingdom':
				offsetLeft = period_offsets[5][0];
				break;
			case 'divided-kingdom':
				offsetLeft = period_offsets[6][0];
				break;
			case 'the-exile':
				offsetLeft = period_offsets[7][0];
				break;
			case 'life-of-christ':
				offsetLeft = period_offsets[8][0];
				break;
			case 'early-church':
				offsetLeft = period_offsets[9][0];
				break;
			case 'middle-ages':
				offsetLeft = period_offsets[10][0];
				break;
			case 'reformation':
				offsetLeft = period_offsets[11][0];
				break;
			case 'revelation-prophecies':
				offsetLeft = period_offsets[12][0];
				break;
		}
		$('div.intro').hide();
		$('div.landing').hide();
		$('div.timeline').show();
	},

	event: function (slug) {
		routerFlag = false; // This disables other routing

		$('div.intro').hide();
		getEventDetail(slug);
		router.navigate('event/' + slug);
	},

	offset: function (offset) {
		offsetLeft = offset;
	}
});

/*	Start the Router
---------------------------------------------------------------------- */
var router = new Router;
Backbone.history.start({ pushState: true, root: '/' });

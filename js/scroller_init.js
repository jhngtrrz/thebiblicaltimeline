/*	Initialize layout
---------------------------------------------------------------------- */
var container = document.getElementById("container");
var content = document.getElementById("stage");
var paper = document.getElementById("paper");
var grid = document.getElementById("grid");
var datebar = document.getElementById("date-bar");
var datebarColor = document.getElementById("date-bar-color");
var yearbubble = document.getElementById("year-bubble");
var sidebar = document.getElementById("sidebars");
var clientWidth = 0;
var clientHeight = container.clientHeight;
var currentTop;
var currentLeft;
var animateSidebar = true;
var changedPeriod = null;

var contentWidth = content.clientWidth;
var contentHeight = 1440;
var footerYearWidth = document.getElementById("period-bar").clientWidth;

content.style.height = contentHeight + "px";
paper.style.width = contentWidth + "px";
grid.style.width = contentWidth + "px";
datebar.style.width = contentWidth + "px";

/*	Define Browser Vendor Prefix	
---------------------------------------------------------------------- */
var docStyle = document.documentElement.style;
var engine;
if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') { engine = 'presto'; }
else if ('MozAppearance' in docStyle) { engine = 'gecko'; }
else if ('WebkitAppearance' in docStyle) { engine = 'webkit'; }
else if (typeof navigator.cpuClass === 'string') { engine = 'trident'; }
var vendorPrefix = { trident: 'ms', gecko: 'Moz', webkit: 'Webkit', presto: 'O' }[engine];
if (vendorPrefix == 'ms') {
	var transformProperty = "transform";
} else {
	var transformProperty = vendorPrefix + "Transform";
}

/*	Function to run while scrolling and on init
---------------------------------------------------------------------- */
var render = (function () {
	return function (left, top) {

		// Move elements while scrolling
		content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(1)'; // Move events
		paper.style[transformProperty] = 'translate3d(' + (-(left / 3)) + 'px, 0, 0) scale(1)'; // Move events
		grid.style[transformProperty] = 'translate3d(' + (-(left / 3)) + 'px, 0, 0) scale(1)'; // Move Grid
		datebar.style[transformProperty] = 'translate3d(' + (-left) + 'px, 0, 0) scale(1)'; // Move datebar
		datebarColor.style[transformProperty] = 'translate3d(' + (-left) + 'px, 0, 0) scale(1)'; // Move datebar (color)

		// Update variables to use elsewhere
		currentTop = top;
		currentLeft = left;

		// Set current period by stage offset
		var adjustedLeft = left + (clientWidth / 2) + 93 - 110;

		if (adjustedLeft < period_offsets[1][0] && adjustedLeft >= period_offsets[0][0]) { setActivePeriod(1, left); }
		if (adjustedLeft < period_offsets[2][0] && adjustedLeft >= period_offsets[1][0]) { setActivePeriod(2, left); }
		if (adjustedLeft < period_offsets[3][0] && adjustedLeft >= period_offsets[2][0]) { setActivePeriod(3, left); }
		if (adjustedLeft < period_offsets[4][0] && adjustedLeft >= period_offsets[3][0]) { setActivePeriod(4, left); }
		if (adjustedLeft < period_offsets[5][0] && adjustedLeft >= period_offsets[4][0]) { setActivePeriod(5, left); }
		if (adjustedLeft < period_offsets[6][0] && adjustedLeft >= period_offsets[5][0]) { setActivePeriod(6, left); }
		if (adjustedLeft < period_offsets[7][0] && adjustedLeft >= period_offsets[6][0]) { setActivePeriod(7, left); }
		if (adjustedLeft < period_offsets[8][0] && adjustedLeft >= period_offsets[7][0]) { setActivePeriod(8, left); }
		if (adjustedLeft < period_offsets[9][0] && adjustedLeft >= period_offsets[8][0]) { setActivePeriod(9, left); }
		if (adjustedLeft < period_offsets[10][0] && adjustedLeft >= period_offsets[9][0]) { setActivePeriod(10, left); }
		if (adjustedLeft < period_offsets[11][0] && adjustedLeft >= period_offsets[10][0]) { setActivePeriod(11, left); }
		if (adjustedLeft < period_offsets[12][0] && adjustedLeft >= period_offsets[11][0]) { setActivePeriod(12, left); }
		if (adjustedLeft >= period_offsets[12][0]) { setActivePeriod(13, left); }

		// Move full-width event titles while scrolling
		$.each($('div.info.full'), function (i, v) {
			var fullParentEvent = $(this).parent(),
				fullOffsetLeft = fullParentEvent.css('left').replace(/[^-\d\.]/g, ''),
				fullEventWidth = fullParentEvent.css('width').replace(/[^-\d\.]/g, ''),
				menuWidthCompensate = 220,
				$this = $(this)[0];
			if ((left + menuWidthCompensate) >= fullOffsetLeft) {
				var newFullLeft = (left + menuWidthCompensate) - fullOffsetLeft;
				if (newFullLeft < (fullEventWidth - 263)) {
					this.style[transformProperty] = 'translate3d(' + newFullLeft + 'px, 0px,0)';
				}
			} else {
				this.style[transformProperty] = 'translate3d(0px, 0px,0)';
			}
		});

	}
})(this);

/*	When the Period Changes
---------------------------------------------------------------------- */
function periodChanged(period) {

	// Update Current Period
	currentPeriod = period;

	// Hide/ Show Events on Timeline for Performance
	$('div.events').html('');
	if (period > 1) { $.each(events[period - 1], function (i, v) { $('div.events').append(v); }); }
	if (period > 2) { $.each(events[period - 2], function (i, v) { $('div.events').append(v); }); }
	$.each(events[period], function (i, v) { $('div.events').append(v); });
	if (period < 13) { $.each(events[period + 1], function (i, v) { $('div.events').append(v); }); }

	// Add hoverability to new event elements in DOM (appended above)
	$('.hover').addClass(hover);

	// Update Footer
	$('div.period').removeClass('active');
	$('div.period-' + period + '-wrap').addClass('active');

	// Update Sidebar
	updateSidebar(period);

	$('a.close').attr('class', 'close period-' + period);
	$('a.related').attr('class', 'related period-' + period);
	$('li.favorites a').attr('class', 'period-' + period);

	// Update URL & footer text
	if (routerFlag == true) {
		var seoDescription = $('.landing-period-' + period + ' h4').html();
		switch (period) {
			case 1:
				router.navigate('period/first-generation');
				$('.period-bar h5').html('First Generation');
				$('.link.period-name').attr('data-period', period).html('First Generation');
				$('.link.age-name').html('Age of Patriarchs');
				setSEO('First Generation | The Bible Timeline', seoDescription);
				break;
			case 2:
				router.navigate('period/noah-and-the-flood');
				$('.period-bar h5').html('Noah & the Flood');
				$('.link.period-name').attr('data-period', period).html('Noah & the Flood');
				$('.link.age-name').html('Age of Patriarchs');
				setSEO('Noah & the Flood | The Bible Timeline', seoDescription);
				break;
			case 3:
				router.navigate('period/the-patriarchs');
				$('.period-bar h5').html('The Patriarchs');
				$('.link.period-name').attr('data-period', period).html('The Patriarchs');
				$('.link.age-name').html('Age of Patriarchs');
				setSEO('The Patriarchs | The Bible Timeline', seoDescription);
				break;
			case 4:
				router.navigate('period/egypt-to-canaan');
				$('.period-bar h5').html('Egypt to Canaan');
				$('.link.period-name').attr('data-period', period).html('Egypt to Canaan');
				$('.link.age-name').html('Age of Israel');
				setSEO('Egypt to Canaan | The Bible Timeline', seoDescription);
				break;
			case 5:
				router.navigate('period/the-judges');
				$('.period-bar h5').html('The Judges');
				$('.link.period-name').attr('data-period', period).html('The Judges');
				$('.link.age-name').html('Age of Israel');
				setSEO('The Judges | The Bible Timeline', seoDescription);
				break;
			case 6:
				router.navigate('period/united-kingdom');
				$('.period-bar h5').html('United Kingdom');
				$('.link.period-name').attr('data-period', period).html('United Kingdom');
				$('.link.age-name').html('Age of Israel');
				setSEO('United Kingdom | The Bible Timeline', seoDescription);
				break;
			case 7:
				router.navigate('period/divided-kingdom');
				$('.period-bar h5').html('Divided Kingdom');
				$('.link.period-name').attr('data-period', period).html('Divided Kingdom');
				$('.link.age-name').html('Age of Israel');
				setSEO('Divided Kingdom | The Bible Timeline', seoDescription);
				break;
			case 8:
				router.navigate('period/the-exile');
				$('.period-bar h5').html('The Exile');
				$('.link.period-name').attr('data-period', period).html('The Exile');
				$('.link.age-name').html('Age of Israel');
				setSEO('The Exile | The Bible Timeline', seoDescription);
				break;
			case 9:
				router.navigate('period/life-of-christ');
				$('.period-bar h5').html('Life of Christ');
				$('.link.period-name').attr('data-period', period).html('Life of Christ');
				$('.link.age-name').html('Age of Christ');
				setSEO('Life of Christ | The Bible Timeline', seoDescription);
				break;
			case 10:
				router.navigate('period/early-church');
				$('.period-bar h5').html('Early Church');
				$('.link.period-name').attr('data-period', period).html('Early Church');
				$('.link.age-name').html('Age of Christ');
				setSEO('Early Church | The Bible Timeline', seoDescription);
				break;
			case 11:
				router.navigate('period/middle-ages');
				$('.period-bar h5').html('Middle Ages');
				$('.link.period-name').attr('data-period', period).html('Middle Ages');
				$('.link.age-name').html('Age of Christ');
				setSEO('Middle Ages | The Bible Timeline', seoDescription);
				break;
			case 12:
				router.navigate('period/reformation');
				$('.period-bar h5').html('Reformation');
				$('.link.period-name').attr('data-period', period).html('Reformation');
				$('.link.age-name').html('Age of Christ');
				setSEO('Reformation | The Bible Timeline', seoDescription);
				break;
			case 13:
				router.navigate('period/revelation-prophecies');
				$('.period-bar h5').html('Revelation Prophecies');
				$('.link.period-name').attr('data-period', period).html('Revelation Prophecies');
				$('.link.age-name').html('Age of Christ');
				setSEO('Revelation Prophecies | The Bible Timeline', seoDescription);
				break;
		}
	}
}

/*	Runs while scrolling
---------------------------------------------------------------------- */
function setActivePeriod(period, left) {

	// Determine when the period actually changes
	if (period != changedPeriod || detailCloseFlag) {
		changedPeriod = period;
		periodChanged(period);
		detailCloseFlag = false;
	}

	// Update current year bubble (Sloppy, fix later)
	var half_view = clientWidth / 2,
		adjust_left = left + half_view - 24,
		current_year = period_offsets[period - 1][2] + (adjust_left - period_offsets[period - 1][0]) / period_offsets[period - 1][3];
	current_year = current_year;

	if (current_year < -100) {
		$('.current-year').html(Math.abs(Math.round(current_year)) + '<span>BC</span>');
	}
	if (current_year > -100 && current_year < 0) {
		current_year = period_offsets[period - 1][2] + (adjust_left - period_offsets[period - 1][0] - 60) / period_offsets[period - 1][3];
		$('.current-year').html(Math.abs(Math.round(current_year)) + '<span>BC</span>');
	}
	if (current_year > 0 && current_year < 34) {
		current_year = period_offsets[period - 1][2] + (adjust_left - period_offsets[period - 1][0] + 60) / period_offsets[period - 1][3];
		$('.current-year').html(Math.abs(Math.round(current_year)) + '<span>AD</span>');
	}
	if (current_year >= 34 && current_year < 2014) {
		$('.current-year').html(Math.abs(Math.round(current_year)) + '<span>AD</span>');
	}
	if (current_year >= 2014) {
		$('.current-year').html('Future');
	}

}

function updateSidebar(period) {
	var sidebarWidth = 220,
		sidebarOffset = sidebarWidth * (period - 1);
	sidebar.style[transformProperty] = 'translate3d(' + (-sidebarOffset) + 'px, 0, 0) scale(1)'; // Move datebar
}

// Run when scrolling slowing down
function slowing(speed) {
	if (speed < 1 && speed > -1 || !speed) {

	} else {

	}
}

/*	Initialize Scroller
---------------------------------------------------------------------- */
this.scroller = new Scroller(render, { zooming: false });

/*	Set Default Offset
---------------------------------------------------------------------- */
var offsetTop = (contentHeight - clientHeight) / 2,
	offsetLeft = (offsetLeft) ? offsetLeft : 0;
scroller.setOffset(offsetLeft, offsetTop);

function scrollTo(top, left) {
	scroller.scrollTo(top, left, true);
}

/*	Reflow handling
---------------------------------------------------------------------- */
var reflow = function () {
	clientWidth = container.clientWidth;
	clientHeight = container.clientHeight;
	footerYearWidth = document.getElementById("period-bar").clientWidth;
	scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);

	// Set dynamic article box height (Wish there were a simple CSS solution...)
	var boxHeight = clientHeight - 330;
	boxHeight = (boxHeight < 400) ? 400 : boxHeight;
	$('div.box').css('height', boxHeight);

	// Set responsive home page height
	if (clientHeight < 700) {
		$('div.arches').hide();
	} else {
		$('div.arches').show();
	}

};
window.addEventListener("resize", reflow, false);
reflow();

/*	Bind Events
---------------------------------------------------------------------- */

// Bind the arrow buttons
$('div.timeline-arrow.top').on('click', function () { scroller.scrollBy(0, -150, true); });
$('div.timeline-arrow.bottom').on('click', function () { scroller.scrollBy(0, 150, true); });
$('div.timeline-arrow.left').on('click', function () { scroller.scrollBy(-250, 0, true); });
$('div.timeline-arrow.right').on('click', function () { scroller.scrollBy(250, 0, true); });

// Bind keyboard arrows
$(document).keydown(function (e) {
	if (e.keyCode == 38) {
		scroller.scrollBy(0, -150, true);
		return false;
	}
	if (e.keyCode == 40) {
		scroller.scrollBy(0, 150, true);
		return false;
	}
	if (e.keyCode == 37) {
		scroller.scrollBy(-250, 0, true);
		return false;
	}
	if (e.keyCode == 39) {
		scroller.scrollBy(250, 0, true);
		return false;
	}
});

// Listen for Touch and Mouse Events on Timeline
if ('ontouchstart' in window) {

	container.addEventListener("touchstart", function (e) {
		if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
			return;
		}
		scroller.doTouchStart(e.touches, e.timeStamp);
		e.preventDefault();
	}, false);
	container.addEventListener("touchmove", function (e) {
		scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
	}, false);
	container.addEventListener("touchend", function (e) {
		scroller.doTouchEnd(e.timeStamp);
	}, false);
	container.addEventListener("touchcancel", function (e) {
		scroller.doTouchEnd(e.timeStamp);
	}, false);

}
else if ('onmsgesturechange' in window) {
	container.addEventListener("MSPointerDown", function (e) {
		scroller.doTouchStart([{
			pageX: e.clientX,
			pageY: e.clientY
		}], e.timeStamp);
	}, false);
	container.addEventListener("MSPointerMove", function (e) {
		scroller.doTouchMove([{
			pageX: e.clientX,
			pageY: e.clientY
		}], e.timeStamp);
	}, false);
	container.addEventListener("MSPointerUp", function (e) {
		scroller.doTouchEnd(e.timeStamp);
	}, false);
	container.addEventListener("MSPointerCancel", function (e) {
		scroller.doTouchEnd(e.timeStamp);
	}, false);
}

else {
	var mousedown = false;
	container.addEventListener("mousedown", function (e) {
		if (e.target.tagName.match(/input|textarea|select/i)) { return; }
		scroller.doTouchStart([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	document.addEventListener("mousemove", function (e) {
		if (!mousedown) { return; }
		scroller.doTouchMove([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	document.addEventListener("mouseup", function (e) {
		if (!mousedown) { return; }
		scroller.doTouchEnd(e.timeStamp);
		mousedown = false;
	}, false);
}

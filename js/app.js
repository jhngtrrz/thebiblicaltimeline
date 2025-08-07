/*	On Page Load
---------------------------------------------------------------------- */
$(function () {

	// Fade Out Mask Once loaded
	setTimeout(function () {
		$('div.mask').fadeOut(300);
	}, 600);
});

/*	Intro Screen
---------------------------------------------------------------------- */
$('div.intro div.launch').on(click, function () {
	router.navigate('home');
	$('div.landing').show();
	$('div.intro').fadeOut(300);
});

/*	Landing Page Zoom Controls
---------------------------------------------------------------------- */
// Click a period from the landing page
$('div.landing-period').on(click, function () {
	// Re-enable the Auto URL Router
	routerFlag = true;

	// Move the timeline to the period
	var period = $(this).attr('data-id'),
		offsetX = period_offsets[(period - 1)][0];
	scroller.scrollTo(offsetX, currentTop, false);

	// Show timeline, while fading through loading mask
	$('div.mask').fadeIn(300, function () {
		$('div.landing').hide();
		$('div.timeline').show();
		$('div.mask').fadeOut(300);
	});
});

// Show Amazing Fact Footer
$('div.landing-footer div.toggle span').on(click, function () {
	$('div.landing-footer').toggleClass('active');
	if ($('div.landing-footer').hasClass('active')) {
		randomFact();
	}
});

/*	Image Protection
---------------------------------------------------------------------- */
// This is done with an HTML element overlaying the image
// with an opacity of 0, but when a user 'right-clicks' 
// the image, this message will appear as an alert...
$('body').on('mousedown', 'div.copyright-mask', function (e) {
	if (e.button == 2) {
		alert('To obtain images likes these please visit GoodSalt.com.')
	}
});

/*	Update SEO
---------------------------------------------------------------------- */
function setSEO(title, description) {
	$('title').html(title);
	$('meta[name=description]').attr('description', description);
}

/*	Click an Event on the Timeline
---------------------------------------------------------------------- */
$('div.events').on(click, 'div.event', function () {
	var slug = $(this).attr('data-slug');
	getEventDetail(slug);
});

function getEventDetail(slug, search) {
	closeMenuBoxes();

	$.getJSON('php/event_detail.php', { slug: slug }, function (d) {
		// Change period + colors
		if (d.period != currentPeriod) {
			scroller.scrollTo(period_offsets[d.period - 1][0], currentTop, false);
		}
		if (search) {
			setTimeout(function () {
				var eventOffset = $('div.event[data-id="' + d.id + '"]').css('left').replace(/[^-\d\.]/g, '');
				scroller.scrollTo(eventOffset - 330, currentTop, false);
			}, 300);
		}

		// Update SEO
		setSEO(d.title + ' | The Biblical Timeline', d.description);

		// Update URL Route
		router.navigate('event/' + d.slug);

		// Update breadcrumbs			
		$('p.breadcrumbs span.era').html(periods[d.period - 1][4]);
		$('p.breadcrumbs span.period').html(periods[d.period - 1][3]);

		// Update Event Detail (Info & Article)
		$('div.detail h1').html(d.title);
		$('div.detail h3').html(d.dates);
		$('div.box.article').html('<p><strong>' + d.description + '</strong><p>');
		$('div.box.article').append('<p>' + d.article + '<p>');

		// Update Favorite Button
		var favorite = false;
		$.each($('div.favorites ul li'), function (i, v) {
			if ($(v).attr('data-slug') == slug) { favorite = true; }
		});
		if (favorite == true) {
			$('div.detail li.favorites a').html('Remove Favorite');
			$('div.detail li.favorites a').removeClass('add').addClass('remove').attr('data-id', d.id);
		} else {
			$('div.detail li.favorites a').html('Add to Favorites');
			$('div.detail li.favorites a').removeClass('remove').addClass('add').attr('data-id', d.id);
		}

		// Update Event Detail (Scriptures)
		$('div.box.scriptures').html('');
		$.each(d.scriptures, function (i, v) {
			$('div.box.scriptures').append('<h4>' + v.reference + '</h4>');
			$.each(v.verses, function (i, v) {
				$('div.box.scriptures').append('<p>' + v.number + ' ' + v.line + '</p>');
			});
		});

		// Update Event Detail (Related)
		$('div.box.related ul').html('');
		$.each(d.related, function (i, v) {
			$('div.box.related ul').append('<li><span data-slug="' + v.slug + '">' + v.title + '</span></li>');
		});

		// Update Event Detail (Images)
		$('div.media ul.pagination').html('');
		$('div.media div.slides').html('');
		var template = $('.media-template').html();
		$.each(d.images, function (i, v) {
			var image = template;
			image = image.replace('%filename%', v['file']);
			image = image.replace('%caption%', v['caption']);
			image = image.replace('%img_alt%', v['caption']);
			$('div.media div.slides').append(image);
			$('div.media ul.pagination').append('<li>' + i + '</li>');
		});

		// Update Event Detail (Video)
		$('div.box.videos ul').html('');
		if (d.videos.length > 0) {
			$('div.detail li.videos').show();
			if (d.videos.length > 1) {
				$('div.detail li.videos a').html('Videos');
				$.each(d.videos, function (i, v) {
					var videoLink = '<li><span ';
					videoLink += 'data-title="' + v.title + '" ';
					videoLink += 'data-caption="' + v.caption + '" ';
					videoLink += 'data-filename="' + v.filename + '" ';
					videoLink += '>' + v.title + '</span></li>';
					$('div.box.videos ul').append(videoLink);
				});
			} else {
				$('div.detail li.videos a').html('Video');
				$.each(d.videos, function (i, v) {
					var videoLink = '<li><span ';
					videoLink += 'data-title="' + v.title + '" ';
					videoLink += 'data-caption="' + v.caption + '" ';
					videoLink += 'data-filename="' + v.filename + '" ';
					videoLink += '>' + v.title + '</span></li>';
					$('div.box.videos ul').append(videoLink);
				});
			}
		} else {
			$('div.detail li.videos').hide();
		}

		// When first image loads
		$('div.media div.loading').show();
		$('div.media div.slides:eq(0) img').load(function () {
			$('div.media div.loading').fadeOut(300);
		});

		// Set default tab & Show detail view			
		$('div.content div.box').hide();
		$('div.content div.box:eq(0)').show();
		$('div.content ul.nav li').removeClass('active');
		$('div.content ul.nav li:eq(0)').addClass('active');
		$('div.media ul.pagination li').removeClass('active');
		$('div.media ul.pagination li:eq(0)').addClass('active');
		$('div.content ul.nav').show();
		if ($('div.media ul.pagination li').length < 2) {
			$('div.media ul.pagination').hide();
		} else {
			$('div.media ul.pagination').show();
		}
		$('div.slide').hide();
		$('div.slide:eq(0)').show();
		$('div.detail').fadeIn(300, function () {
			$('div.landing').fadeOut(300);
			$('div.timeline').fadeIn(300);
		});
	});
}

// Initialize Flowplayer
$(".flowplayer").flowplayer({ ratio: 3 / 4, clip: { autoPlay: false } });
var flowplayer = flowplayer($(".flowplayer"));

// Click a Video Link
$('div.box.videos ul').on(click, 'li span', function (e) {
	var title = $(this).attr('data-title'),
		caption = $(this).attr('data-caption'),
		filename = $(this).attr('data-filename');

	// Update video	
	flowplayer.load(filename);

	$('div.video-wrap h3').html(title);
	$('div.video-wrap p').html(caption);
	$('div.video-modal').fadeIn(300);
});

// Close Video Modal
$('div.video-modal, div.video-wrap span.close').on(click, function () {
	$('div.video-modal').fadeOut(300, function () {
		flowplayer.stop();
		flowplayer.unload();
	});
});
$('div.video-wrap').on(click, function (e) { e.stopPropagation(); });

// Click related event
$('div.box.related ul').on(click, 'li span', function (e) {
	e.preventDefault();
	var slug = $(this).attr('data-slug');
	getEventDetail(slug, true);
});

// Click search result
$('div.dropdown.search ul').on(click, 'li', function (e) {
	e.preventDefault();
	var slug = $(this).attr('data-slug');
	getEventDetail(slug, true);
});

/*	Event Detail Functionality
---------------------------------------------------------------------- */
// Close the detail view
$('div.detail, a.close, a.detail-back').on(click, function (e) {
	if (e.target !== this) return; // Prevent children from firing event

	e.preventDefault();
	$('div.detail').fadeOut(300);

	// Remove routerFlag
	routerFlag = true;

	// Scroll 1px to left to reset period
	detailCloseFlag = true;
	scroller.scrollTo(currentLeft + 1, currentTop, false);
});

// Slide Pagination
$('div.detail').on(click, 'ul.pagination li', function () {
	// Change pagination active class
	$('div.media ul.pagination li').removeClass('active');
	$(this).addClass('active');

	// Hide/ Show Slides
	var slide = $(this).index();
	$('div.slide').hide();
	$('div.slide:eq(' + slide + ')').show();
});

// Click Nav Tabs
$('div.content ul.nav li a').on(click, function (e) {
	if (!$(this).parent().hasClass('favorites')) { // Ignore the "Add to Favorites" button
		if ($(this).html() != 'Video') {
			// Change active tab
			$('div.content ul.nav li').removeClass('active');
			$(this).parent().addClass('active');

			// Hide/ Show Box
			var box = $(this).parent().index();
			$('div.content div.box').hide();
			$('div.content div.box:eq(' + box + ')').show();
		} else {
			// Automatically show video (if only one)
			var video = $('div.box.videos ul li:eq(0) span');
			var title = video.attr('data-title'),
				caption = video.attr('data-caption'),
				filename = video.attr('data-filename');
			flowplayer.load(filename);

			$('div.video-wrap h3').html(title);
			$('div.video-wrap p').html(caption);
			$('div.video-modal').fadeIn(300);
		}
	}
	return false;
});

// Click related icon (Remove?)
$('a.related').on(click, function (e) {
	e.preventDefault();
	$('div.content div.box').hide();
	$('div.content div.box:eq(2)').show();
	$('div.content ul.nav li').removeClass('active');
	$('div.content ul.nav li:eq(2)').addClass('active');
});

/*	Hover over an Event
---------------------------------------------------------------------- */
$(function () {
	// Hover On
	$('body').on('mouseover', 'div.event', function () {
		if (hover == 'hoverable') {
			var hoverWidth = $(this).attr('data-hover'),
				hoverPeriod = $(this).attr('data-period');

			// Update Color Datebar
			$('div.date-bar-color').attr('class', 'date-bar-color date-bar-color-' + hoverPeriod);
			$('div.date-bar-color ul').attr('class', 'period-text-' + hoverPeriod);

			// Setup	
			var pointer = $('canvas.pointer'),
				color = $(this).css('background-color'),
				eventTop = parseInt($(this).css('top').replace(/[^-\d\.]/g, '')),
				eventLeft = parseInt($(this).css('left').replace(/[^-\d\.]/g, '')),
				eventType = ($(this).hasClass('major')) ? 'major' : 'minor',
				dateBarHeight = 66,
				footerHeight = 75,

				pHeightType = (eventType == 'major') ? 80 : 30,
				pointerDirection = 'top',

				clientAdjustedHeight = clientHeight - footerHeight - dateBarHeight - 2,

				pointerHeight = 100;
			pointerHeight = clientAdjustedHeight - ((eventTop - currentTop) + pHeightType) - 0;
			pointerHeight = (pointerHeight < 14) ? 0 : pointerHeight;

			// Set canvas dimensions
			pointer.attr('width', 14).attr('height', pointerHeight);

			// Set canvas position
			var eventTopAdjust = eventTop + pHeightType;
			pointer.css({ 'top': eventTopAdjust, 'left': eventLeft });

			// Set canvas parameters
			var ctx = pointer[0].getContext('2d');
			ctx.beginPath();
			ctx.moveTo(0, 0);
			if (pointerDirection == 'top') {
				ctx.lineTo(0, pointerHeight);
				ctx.lineTo(14, 0);
			} else {
				ctx.lineTo(0, pointerHeight);
				ctx.lineTo(14, pointerHeight);
			}
			ctx.lineTo(0, 0);
			ctx.closePath();
			ctx.strokeStyle = 'rgba(255,255,255,0.1)';
			ctx.stroke();
			ctx.fillStyle = color;
			ctx.fill();

			// Show pointer
			pointer.show();

			// Update color datebar
			var eventStart = $(this).attr('data-start'),
				eventEnd = $(this).attr('data-end'),
				eventYears = eventEnd - eventStart,
				periodPxPerYear = period_offsets[currentPeriod - 1][3],
				eventWidth = eventYears * periodPxPerYear;
			$('div.date-bar-color ul').css({
				'margin-left': -(eventLeft - 55)
			});
			$('div.date-bar-color').css({
				'width': hoverWidth,
				'left': eventLeft,
				'background-position-x': -eventLeft
			}).show();
		}
	});

	// Hover Off
	$('body').on('mouseout', 'div.event', function () {
		// Hide pointer
		$('canvas.pointer').hide();
		$('div.date-bar-color').hide();
	});
});

/*	Random Amazing Fact
---------------------------------------------------------------------- */
function randomFact() {
	var factCount = $('p.amazing-fact').length - 1,
		randomFact = Math.floor(Math.random() * factCount) + 0;
	$('p.amazing-fact').hide();
	$('p.amazing-fact:eq(' + randomFact + ')').show();
}
randomFact();

/*	Menu Functionality
---------------------------------------------------------------------- */

// Click a menu button
$('div.menu li').on(click, function () {
	closeMenuBoxes();
	if (!$(this).hasClass('home') && !$(this).hasClass('tools')) {
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$('div.dropdown').hide();
		} else {
			$(this).addClass('active');
			var dropdown = $(this).attr('data-dropdown');
			$('div.dropdown.' + dropdown).show();
		}
	}
	if ($(this).hasClass('home')) {
		goHome();
	}
});

// Clicking the logo
$('div.menu h2').on(click, function () { goHome(); });

// Cursor in the search input
$('div.menu input.search').on('focus', function () {
	closeMenuBoxes();
	if ($(this).val()) {
		$('div.dropdown.search').show();
	}
});

// Open/ Close Menu
$('div.menu div.menu-toggle').on(click, function () {
	if ($('div.menu').hasClass('open')) {
		closeMenuBoxes();
		$('div.menu').removeClass('open').addClass('closed');
	} else {
		$('div.menu').removeClass('closed').addClass('open');
	}
});

// Function to close menu boxes
function closeMenuBoxes() {
	$('div.menu li').removeClass('active');
	$('div.menu div.dropdown').hide();
}

// Go to Landing
function goHome() {
	if ($('div.landing').is(':hidden')) {
		// Change Amazing Fact
		randomFact();

		// Update SEO
		setSEO('The Biblical Timeline', 'From the creation of the world to the last-day events of Revelation, the timeline is a comprehensive guide to major Bible events, characters, and prophecies.');

		// Change URL
		routerFlag = false;
		router.navigate('home');

		$('div.mask').fadeIn(300, function () {
			$('div.landing').show();
			$('div.timeline').hide();
			$('div.mask').fadeOut(300);
		});
	}
}

// Close menu boxes when clicking sidebar or timeline
$('.sidebar,.timeline').on(click, function (e) { closeMenuBoxes(); });

/*	Search functionality
---------------------------------------------------------------------- */
// Typing into the search field
$('input.search').on('keypress', function (e) {
	if (e.keyCode != 13) {
		var query = $(this).val() + String.fromCharCode(e.which);
		search(query);
	}
}).on('keyup', function (e) {
	if (e.keyCode == 8) {
		var query = $(this).val();
		search(query);
	}
});

// Show search results
function search(query) {
	// Show results dropdown
	$('div.menu div.search').show();
	if (query == '') { $('div.menu div.search').hide(); }

	// Get result template
	var template = $('.result-template').html();

	// Query the database
	if (query) {
		$.getJSON('php/search.php', { search: query }, function (d) {
			var count;
			if (d.count == 0) count = 'No Results';
			if (d.count == 1) count = '1 Result';
			if (d.count > 1) count = d.count + ' Results';
			$('div.dropdown.search h4').html(count); // Display result count
			$('div.dropdown.search ul').html(''); // Clear previous results
			$.each(d.events, function (i, v) {
				var result = template;
				result = result.replace('%title%', v[1]);
				result = result.replace('%slug%', v[0]);
				$('div.dropdown.search ul').append(result); // Append results
			});
		});
	} else {
		$('div.dropdown.search ul').html(''); // Clear previous results
	}
}

/*	Click the Social Links
---------------------------------------------------------------------- */
function updateSocialLinks() {
	var url = document.URL;
	var username = "mattjivaldi"; // bit.ly username
	var key = "R_4bfc4ef98ed12ba6bad8ba5fc44c5c61";
	$.ajax({
		url: "http://api.bit.ly/v3/shorten",
		data: { longUrl: url, apiKey: key, login: username },
		dataType: "jsonp",
		success: function (v) {
			// Update hrefs
			$('li.twitter a').attr('href', 'https://twitter.com/intent/tweet?text=&url=' + v.data.url + '&hashtags=thebiblicaltimeline');
			$('li.facebook a').attr('href', 'http://www.facebook.com/sharer/sharer.php?u=' + v.data.url);
			$('li.google a').attr('href', 'https://plus.google.com/share?url=' + v.data.url);

		}
	});
} updateSocialLinks();

/*	Menu Functionality
---------------------------------------------------------------------- */
// Open FAQ Modal
$('div.faq li').on(click, function () {
	var title = $(this).html(),
		id = $(this).attr('data-id');

	// Update Header
	$('div.faq-content .heading h3').html(title);

	// Hide/ Show Answer	
	$('div.faq-answer').hide();
	$('div.faq-answer.' + id).show();

	// Show the FAQ Modal
	$('div.faq-modal').fadeIn(300);
});

// Open Account Modal
$('div.account li.signin').on(click, function () {
	$('div.account-modal').fadeIn(300);
});

// Close Modal
$('div.modal a.close').on(click, function (e) {
	e.preventDefault();
	$('div.modal').fadeOut(300);
});

/*	Tooltip Function
---------------------------------------------------------------------- */
var tooltipFlag = false, tooltipShow, tooltipHide;
function showTooltip(message) {
	if (tooltipFlag) { // If tooltip is currently visible
		// Disable active timeouts
		clearTimeout(tooltipShow);
		clearTimeout(tooltipHide);

		// Fade out Tooltip
		$('div.tooltip').fadeIn(300);

		// Fade in/ out tooltip with timers
		tooltipShow = setTimeout(function () {
			$('div.tooltip').html(message).fadeIn(300);
		}, 400);
		tooltipHide = setTimeout(function () {
			$('div.tooltip').fadeOut(300);
			tooltipFlag = false;
		}, 3000);
	} else {
		tooltipFlag = true;
		tooltipShow = setTimeout(function () {
			$('div.tooltip').html(message).fadeIn(300);
		}, 400);
		tooltipHide = setTimeout(function () {
			$('div.tooltip').fadeOut(300);
			tooltipFlag = false;
		}, 3000);
	}
}

/*	Account Functionality
---------------------------------------------------------------------- */

// Sign In
$('form.signin').on('submit', function (e) {
	e.preventDefault();
	var data = $(this).serialize();
	$('form.signin span').hide();
	$.getJSON('php/account.php', data, function (d) {
		if (d.success) {
			// Update currentUser Global Variable
			currentUser = d.user_id;

			// Close Modal
			$('div.modal').fadeOut(300);

			// Update menu
			$('div.account li.signin').hide();
			$('div.account li.signout').show();

			// Reset Form
			$('form.signin')[0].reset();

			// Populate user favorites
			getFavorites(d.user_id);

			// Show tooltip
			showTooltip("You've Signed In");
		} else {
			if (d.email) {
				// Password incorrect
				$('form.signin span.password').show();
			} else {
				// Email incorrect
				$('form.signin span.email').show();
			}
		}
	});
});

// Sign Out
$('div.account li.signout').on(click, function () {
	$.getJSON('php/account.php', { type: 'signout' }, function (d) {
		if (d.success) {
			// Update currentUser Global Variable
			currentUser = 0;

			// Update menu
			$('div.account li.signin').show();
			$('div.account li.signout').hide();

			// Update Favorites List
			getFavorites(0);

			// Show tooltip
			showTooltip("You've Signed Out");
		}
	});
});

// Click on a Favorite from Menu
$('body').on(click, 'div.favorites ul li', function (e) {
	var slug = $(this).attr('data-slug');
	getEventDetail(slug);
});

// Function to Get List of User Favorites
function getFavorites(user_id) {

	// Clear Favorites Dropdown
	$('div.favorites h4').html('My Favorites');
	$('div.favorites ul').html('');

	if (user_id != 0) {

		$.ajax({
			url: 'php/get_favorites.php',
			cache: false,
			dataType: "json",
			type: "GET",
			data: { 'user_id': user_id }
		}).done(function (d) {
			// Append each event to list
			$.each(d, function (i, v) {
				$('div.favorites ul').append('<li data-slug="' + v.slug + '">' + v.title + '</li>');
			});
		});

	}
}
getFavorites(currentUser);

// Add or Remove Favorite
$('div.detail li.favorites a').on(click, function (e) {
	e.preventDefault();
	var event_id = $(this).attr('data-id');

	if (currentUser != 0) {
		if ($(this).hasClass('remove')) {

			// Remove from Database
			$.ajax({
				url: 'php/set_favorites.php',
				cache: false,
				type: "GET",
				data: {
					type: 'remove',
					event_id: event_id,
					user_id: currentUser
				}
			}).done(function () {

				// Update Favorites List
				getFavorites(currentUser);

				// Update Button
				$('div.detail li.favorites a').html('Add to Favorites');
				$('div.detail li.favorites a').removeClass('remove').addClass('add');

				// Show tooltip
				showTooltip('Removed from Favorites');
			});
		} else {

			// Add to Database		
			$.ajax({
				url: 'php/set_favorites.php',
				cache: false,
				type: "GET",
				data: {
					type: 'add',
					event_id: event_id,
					user_id: currentUser
				}
			}).done(function () {
				// Update Favorites List
				getFavorites(currentUser);

				// Update Button
				$('div.detail li.favorites a').html('Remove Favorite');
				$('div.detail li.favorites a').removeClass('add').addClass('remove');

				// Show tooltip
				showTooltip('Added to Favorites');
			});
		}
	} else {
		// Tell user to log in
		showTooltip('Please Sign In to Add Favorite');
	}
});

/*	Footer Date Bar Functionality
---------------------------------------------------------------------- */

// Clone the date bar
$('div.footer table.years').clone().addClass('light').insertAfter('div.footer table.years');

// Click a period from the footer
$('div.footer div.period').on(click, function () {
	// Disable sidbar animations

	// Scroll the timeline
	var period = $(this).attr('data-period'),
		offsetX = period_offsets[(period - 1)][0];
	scroller.scrollTo(offsetX, currentTop, false);

	// Move the sidebar
	updateSidebar(period);

});

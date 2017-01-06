var map;
var placesSearch;
var directionsDisplay;
var largeInfowindow;
var modes = ['Driving', 'Walking', 'Bicycling', 'Transit'];

// The coordinate of Silcon Valley.
var initial = {
    lat: 37.387474,
    lng: -122.057543
};

// Used for yelp place search.
var latlng = {
    lat: 0,
    lng: 0
};

// The icon of center marker i.e. the location you tend to search around.
var icon;

// If we cannot get google response in 8 seconds,then shows the error message.
var googleRequestTimeout = setTimeout(function() {
    vm.mapError(true);
}, 8000);

/**
 * @description Initialize the map which center in Silicon Valley
 * if the google map request succeeds.
 */
function initMap() {
    clearTimeout(googleRequestTimeout);
    vm.mapLoad(true);
    map = new google.maps.Map(document.getElementById('map'), {
        center: initial,
        zoom: 15,
        mapTypeControl: false
    });

    // This autocomplete is for use in the geocoder entry box.
    placesSearch = new google.maps.places.Autocomplete(
        (document.getElementById('places-search')));

    // Listen for the event fired when the user selects a prediction from the
    // picklist and retrieve more details for that place.
    placesSearch.addListener('place_changed', function() {
        searchPlaces();
    });

    largeInfowindow = new google.maps.InfoWindow();

    icon = {
        url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|679df6|40|_|%E2%80%A2',
        size: new google.maps.Size(21, 34),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 34),
        scaledSize: new google.maps.Size(21, 34)
    };

    // Start a new search around initial location.
    searchPlaces({
        location: initial
    });
}

/**
 * @description Search around the location which is the input value in the "Near" text input for business places.
 * @param {object} request - The coordinate of the location.
 * @param {string} term - Yelp search term (e.g. "food", "restaurants").
 */
function searchPlaces(request, term) {
    vm.locationError(0);
    vm.searchEmpty(false);
    vm.searchFailed(false);
    var place;

    // If search by address.
    if (typeof(request) == 'undefined') {
        place = placesSearch.getPlace();

        // If search is empty or return no result show error message.
        place.name === "" ? vm.searchEmpty(true) : (place.geometry ? searchSucceed() : vm.searchFailed(true));
        return;
    }
    var geocoder = new google.maps.Geocoder();

    // Geocode the address/area entered to get the center.
    geocoder.geocode(
        request,
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                place = results[0];
                searchSucceed();
            } else {
                vm.searchFailed(true);
            }
        });

    /**
     * @description Search succeeds by address or location.
     */
    function searchSucceed() {
        // Remove the previous center marker from the map.
        if (cm.marker()) {
            cm.marker().setMap(null);
        }
        map.setCenter(place.geometry.location);
        var title = place.address_components[0].short_name;
        var center = place.formatted_address;
        if (typeof(title) == "undefined") {
            title = center;
        }
        vm.title(title);
        vm.center(center);
        cm.create(place);
        newPlaceSearch(place.formatted_address, term);
    }
}

/**
 * @description Generates a random number and returns it as a string for OAuthentication
 * @return {string}
 */
function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
}

var yelp_url = 'http://api.yelp.com/v2/search',
    yelp_key = 'GBzdouuzuehAS1eKl5WGHg',
    yelp_key_secret = 'jAl4d0vuCI7XJY3DMFVsYxET4PQ',
    yelp_token = 'KhvBiuMmDYHKB9L9B5wzoNr9XywM7Dxh',
    yelp_token_secret = 'wDzMn0gVn8xKBu4l26soAIg1f9E';

/**
 * @description Retrieve business places information using yelp api.
 * @param {string} location - The formatted address of the location retrieved from google api.
 * @param {string} term - Yelp search term (e.g. "food", "restaurants").
 */
function newPlaceSearch(location, term) {
    // Hide and remove all the previous place markers.
    pm.hide();
    pm.markers.removeAll();
    var parameters = {
        oauth_consumer_key: yelp_key,
        oauth_token: yelp_token,
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb', // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
        location: location,
        sort: 1,
        radius_filter: 10000
    };
    if (term) {
        parameters.term = term;
    }
    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, yelp_key_secret, yelp_token_secret);
    parameters.oauth_signature = encodedSignature;

    // If we cannot get yelp response in 8 seconds,then shows the error message.
    var yelpRequestTimeout = setTimeout(function() {
        vm.yelpError(true);
    }, 8000);
    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true, // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
        dataType: 'jsonp',
        success: function(results) {
            // Request succeeds.
            vm.yelpError(false);
            clearTimeout(yelpRequestTimeout);
            nearbySearch(results);

        },
        fail: function(xhr, status, error) {
            // Request fails.
            vm.yelpError(true);
        }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}

/**
 * @description Create markers for the business places retrieved.
 * @param {object} results - places information retrieved from yelp api.
 */
function nearbySearch(results) {
    var all = results.businesses;
    all.forEach(function(place) {

        // Ignore places' whose coordinates are unknown.
        if (typeof(place.location.coordinate) == "undefined") {
            return;
        }
        pm.create(place);
    });
    vm.showListings();
}

/**
 * @description Show error message if the google map request fails.
 */
function googleError() {
    vm.mapError(true);
}

// Custom biding used for sliding up and down the menu using Jquery slideDown and slideUp.
ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        // Get the current value of the current property we're bound to.
        $(element).toggle(value);
        // jQuery will hide/show the element depending on whether "value" or true or false.
    },

    update: function(element, valueAccessor) {
        // First get the latest data that we're bound to.
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value.
        var valueUnwrapped = ko.utils.unwrapObservable(value);

        // Now manipulate the DOM element.
        valueUnwrapped ? $(element).slideDown('slow') : $(element).slideUp('fast');
    }
};

/**
 * @description Stores observables of business places near the center location.
 * @constructor
 */
var PlaceMarkers = function() {
    var self = this;
    self.markers = ko.observableArray([]);
    self.selected = ko.observable();

    /**
     * @description Create marker for the business place.
     * @param {object} place - place information retrieved from yelp api.
     */
    self.create = function(place) {
        var coordinate = place.location.coordinate;
        latlng.lat = coordinate.latitude;
        latlng.lng = coordinate.longitude;
        var marker = new google.maps.Marker({
            position: latlng,
            title: place.name,
            id: place.id,
            animation: google.maps.Animation.DROP
        });
        marker.place = place;

        //The navigate buttons are initial hidden.
        marker.navigateEnabled = ko.observable(false);

        // Push the marker to our array of markers.
        self.markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow);

            // The navigate button shows when its corresponding marker is clicked on the map.
            self.markers().forEach(function(e) {
                (e.id === marker.id) ? e.navigateEnabled(true): e.navigateEnabled(false);
            });
        });

        // Two event listeners - one for mouseover, one for mouseout, to make the marker bounce or not.
        marker.addListener('mouseover', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
        });
        marker.addListener('mouseout', function() {
            this.setAnimation(null);
        });

    };

    /**
     * @description Loop through the place markers and hide them all.
     */
    self.hide = function() {
        self.markers().forEach(function(marker) {
            marker.setMap(null);
        });
    };

    /**
     * @description Populates the infowindow contains yelp information based on marker's position when the marker is clicked.
     * @param {object} marker - Place marker shows on the map.
     * @param {object} infowindow - The infomation window populates when the marker is clicked.
     */
    self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {

            // Clear the infowindow content to give the yelp time to load.
            infowindow.setContent('');
            infowindow.marker = marker;

            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            // The infowindow contains place name,image,address,rating,review count and categories.
            var place = marker.place,
                content = '<div class="info"><section class="info-left">';
            if (place.image_url) {
                content += '<img src="' + place.image_url + '" alt="Business photo">';
            }
            content += '</section><section class="info-right">';
            if (place.name) {
                content += '<div class="info-name">';
                content += (place.url) ? '<a class="info-link" href="' + place.url + '" target="_blank">' + place.name + '</a></div>' : place.name + '</div>';
            }
            if (place.location.address) {
                content += '<div class="info-addr">' + place.location.address + '</div>';
            }
            content += '<div class="info-rating">';
            if (place.rating && place.rating_img_url) {
                content += '<img class="info-rating-left" src="' + place.rating_img_url + '" alt="' + place.rating + '">';
            }
            content += '<a href="https://www.yelp.com" target="_blank"><img class="info-yelp" src="img/yelp.png" alt="Yelp logo"></a></div>';
            if (place.review_count) {
                content += '<div class="info-review">Based on ' + place.review_count + ' reviews</div>';
            }

            // Display no more than two categories.
            if (place.categories) {
                var categories_arr = [];
                place.categories.forEach(function(e) {
                    categories_arr.push(e[0]);
                });
                var categories = categories_arr.slice(0, 2).join(',');
                content += '<div class="info-cate">' + categories + '<div>';
            }
            content += '</section></div>';
            infowindow.setContent(content);

            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
    };
};

/**
 * @description Stores observable of marker of the center location.
 * @constructor
 */
var CenterMarker = function() {
    var self = this;
    self.marker = ko.observable();

    /**
     * @description Create marker for the center location.
     * @param {object} place - place information retrieved from google api.
     */
    self.create = function(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
            icon: icon,
            id: place.id,
            animation: google.maps.Animation.DROP
        });
        self.marker(marker);

        // Two event listeners - one for mouseover, one for mouseout,
        // to make the marker bounce or not.
        marker.addListener('mouseover', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
        });
        marker.addListener('mouseout', function() {
            this.setAnimation(null);
        });

    };
};

/**
 * @description Stores all the main functions and observables, and calles functions.
 * @constructor
 */
var ViewModel = function() {
    var self = this;
    self.btn = ko.observable(false);

    // Whether thr map initialization succeeds or not.
    self.mapLoad = ko.observable(false);

    /**
     * @description Display menu upon click of hamburger Icon after the map initialized.
     */
    self.toggleBtn = function() {
        if (self.mapLoad()) {
            self.btn(!self.btn());
        }
    };

    // Display the short name of the location in the title.
    self.title = ko.observable('your favourite!');

    // The input value of "Near" text input.
    self.center = ko.observable('');

    // The input value of "Find" text input.
    self.querystr = ko.observable('');

    // Display the directions panel.
    self.showDirections = ko.observable(false);

    // Show the error message caused by various reasons.
    self.mapError = ko.observable(false);
    self.yelpError = ko.observable(false);
    self.directionsError = ko.observable(false);
    self.searchEmpty = ko.observable(false);
    self.searchFailed = ko.observable(false);
    self.locationError = ko.observable(0);
    self.terms = ko.observableArray(['food', 'restaurants', 'active life', 'medical']);
    self.mode = ko.observableArray([]);
    modes.forEach(function(e, i) {
        var mode = {};
        mode.text = e;
        mode.selected = ko.observable(false);
        self.mode.push(mode);
    });

    // Default option is driving mode
    self.mode()[0].selected(true);

    // Stores all the markers on the list after filtered.
    self.list = ko.computed(function() {
        if ($.trim(self.querystr()).length === 0) {
            return pm.markers();
        } else {
            return ko.utils.arrayFilter(pm.markers(), function(marker) {
                return marker.title.toLowerCase().indexOf(self.querystr().toLowerCase()) > -1;
            });
        }
    });

    /**
     * @description Loop through the markers on the list and display them all.
     */
    self.showListings = function() {
        var bounds = new google.maps.LatLngBounds(),
            // Extend the boundaries of the map for each marker and display the marker
            markers = self.list(),
            len = markers.length;
        if (len === 0) {
            return;
        }
        for (var i = 0; i < len; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    };

    /**
     * @description Filter markers based on input value in the "Find" text input.
     */
    self.filter = function() {
        pm.hide();
        self.showListings();
    };

    /**
     * @description Search by the user's geographical location.
     */
    self.myPosition = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                initial.lat = position.coords.latitude;
                initial.lng = position.coords.longitude;
                searchPlaces({
                    location: initial
                });
                self.locationError(0);
            }, function() {
                self.locationError(1);
            });
        } else {
            // Browser doesn't support Geolocation
            self.locationError(2);
        }
    };

    /**
     * @description Using specific term to search.
     * @param {string} term - Yelp search term (e.g. "food", "restaurants").
     */
    self.termSerach = function(term) {
        searchPlaces(undefined, term);
    };

    /**
     * @description When the user move mouse over the marker,make the marker bounce.
     * @param {object} marker - The marker mouseover on the map or list.
     */
    self.listMouseOver = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    };

    /**
     * @description When the user move mouse over the marker,stop the bounce.
     * @param {object} marker - The marker mouseout on the map or list.
     */
    self.listMouseOut = function(marker) {
        marker.setAnimation(null);
    };

    /**
     * @description When the user click the marker,make the marker bounce,
     * open the infowindow and enable the navigate button.
     * @param {object} marker - The marker selected by the user on the map or list.
     */
    self.listClick = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        pm.populateInfoWindow(marker, largeInfowindow);
        self.list().forEach(function(e) {
            e.navigateEnabled(false);
        });
        marker.navigateEnabled(true);
    };

    /**
     * @description Display navigation panel.
     * @param {object} marker - The marker selected by the user on the map or list.
     */
    self.navigate = function(marker) {
        pm.selected(marker);
        self.showDirections(true);
        self.displayDirections(self.mode()[0]);
    };

    /**
     * @description Using direction service to display navigation.
     * @param {object} mode - Directions mode ("Driving","Walking","Bicycling","Transit").
     */
    self.displayDirections = function(mode) {
        pm.hide();
        cm.marker().setMap(null);
        self.mode().forEach(function(e) {
            e.selected(false);
        });
        mode.selected(true);
        var directionsService = new google.maps.DirectionsService;
        // Clear the previous results.
        if (typeof(directionsDisplay) != 'undefined') {
            directionsDisplay.setMap(null);
            directionsDisplay.setPanel(null);
        }
        var request = {
            // The origin is the center marker's position,while the desc is the selected marker's.
            origin: cm.marker().position,
            destination: pm.selected().position,
            travelMode: google.maps.TravelMode[mode.text.toUpperCase()]
        };
        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                vm.directionsError(false);
                directionsDisplay = new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    draggable: true,
                    polylineOptions: {
                        strokeColor: 'green'
                    },
                    panel: document.getElementById('panel')
                });
            } else {
                vm.directionsError(true);
            }
        });
    };

    /**
     * @description When the user click the close button on the navigation panel,
     * hide the navigation and show the markers on the map and list.
     * @param {object} marker - The marker selected by the user on the map or list.
     */
    self.hideDirections = function() {
        self.showDirections(false);
        cm.marker().setMap(map);
        if (typeof(directionsDisplay) != 'undefined') {
            directionsDisplay.setMap(null);
            directionsDisplay.setPanel(null);
        }
        self.showListings();
    };
};

var cm = new CenterMarker();
var pm = new PlaceMarkers();
var vm = new ViewModel();
ko.applyBindings(vm);
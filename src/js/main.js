//Create a map variable
     var map;
      // Create a new blank array for all the listing markers.
      //var markers = [];
      // Create placemarkers array to use in multiple functions to have control
      // over the number of places that show.
      var placesSearch;
      var directionsDisplay;
      var largeInfowindow;

      var modes=['Driving','Walking','Bicycling','Transit'];
      var initial={lat:37.387474,lng:-122.057543},latlng={lat:0,lng:0};

       var icon;
     //Initialize the map
     function initMap() {
      vm.mapError(false);
      //  Create a new map center in Silicon Valley.
       map=new google.maps.Map(document.getElementById('map'),{
          center:initial,
          zoom:15,
          mapTypeControl: false
       });

      // This autocomplete is for use in the geocoder entry box.
       placesSearch = new google.maps.places.Autocomplete(
        (document.getElementById('places-search')),
        {types: ['geocode']});

        // Listen for the event fired when the user selects a prediction from the
        // picklist and retrieve more details for that place.
        placesSearch.addListener('place_changed', function () {
          searchPlaces({address:vm.center()});
        });

        largeInfowindow = new google.maps.InfoWindow();

        icon = {
             url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|679df6|40|_|%E2%80%A2',
             size: new google.maps.Size(21, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34),
            scaledSize: new google.maps.Size(21, 34)
          };


searchPlaces({location:initial});
}

// This function takes the input value in the find area text input
      // locates it, and then zooms into that area. This is so that the user can
      // show all listings, then decide to focus on one area of the map.
      function searchPlaces(request,term) {
       // console.log(request);
       vm.locationError(0);
        if(typeof(request.address)!='undefined'&&request.address==''){
          vm.searchEmpty(true);
          return;
        }
        vm.searchEmpty(false);
        var geocoder = new google.maps.Geocoder();
           // Geocode the address/area entered to get the center. Then, center the map
          // on it and zoom in
          geocoder.geocode(
            request, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                vm.searchFailed(false);
                if(cm.marker()){
                    cm.marker().setMap(null);
                }
                place=results[0];
                map.setCenter(place.geometry.location);
                var title=place.address_components[0].short_name;
                var center=place.formatted_address;
                if(typeof(title)== "undefined"){
                  title=center;
                }
                vm.title(title);
                vm.center(center);
                cm.create(place);
                newPlaceSearch(place.formatted_address,term);
              } else {
                vm.searchFailed(true);
              }
            });
      }

        /**
 * Generates a random number and returns it as a string for OAuthentication
 * @return {string}
 */
function nonce_generate() {
  return (Math.floor(Math.random() * 1e12).toString());
}

var yelp_url = 'http://api.yelp.com/v2/search',
    yelp_key='GBzdouuzuehAS1eKl5WGHg',
    yelp_key_secret='jAl4d0vuCI7XJY3DMFVsYxET4PQ',
    yelp_token='KhvBiuMmDYHKB9L9B5wzoNr9XywM7Dxh',
    yelp_token_secret='wDzMn0gVn8xKBu4l26soAIg1f9E';



function newPlaceSearch (location,term) {
   pm.hide();
   pm.markers.removeAll();
      var parameters = {
      oauth_consumer_key: yelp_key,
      oauth_token: yelp_token,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
      location:location,
      //limit:10,
      sort:1,
      radius_filter:10000
      // cll:initial.lat+','+initial.lng,
    };

    if(typeof(term)!="undefined"){
      parameters.term=term;
    }
    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, yelp_key_secret, yelp_token_secret);
    parameters.oauth_signature = encodedSignature;

    var yelpRequestTimeout=setTimeout(function () {
       vm.yelpError(true);
    },8000);
    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        // Do stuff with results
        vm.yelpError(false);
        clearTimeout(yelpRequestTimeout);
        nearbySearch(results);

      },
      fail: function(xhr, status, error) {
      // Do stuff on fail
      //console.log("An AJAX error occured: " + status + "\nError: " + error + "\nError detail: " + xhr.responseText);
      //console.log(vm.yelpError());

    }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}

      function nearbySearch(results) {
        var all=results.businesses;
        all.forEach( function(place) {
        if(typeof(place.location.coordinate)== "undefined"){
          return;
        }
          pm.create(place);
        });
        vm.showListings();
    }










function googleError(){
  vm.mapError(true);
}

      ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        // Get the current value of the current property we're bound to
        $(element).toggle(value);
        // jQuery will hide/show the element depending on whether "value" or true or false
    },

    update: function(element, valueAccessor) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.utils.unwrapObservable(value);

        // Now manipulate the DOM element
        valueUnwrapped == true?$(element).slideDown('slow'):$(element).slideUp('fast');
    }
};
var PlaceMarkers=function () {
  var self=this;
  self.markers=ko.observableArray([]);
  self.selected=ko.observable();
  self.create=function(place) {
        var coordinate=place.location.coordinate;
        latlng.lat=coordinate.latitude;
        latlng.lng=coordinate.longitude;
        var marker = new google.maps.Marker({
          position: latlng,
          title: place.name,
          id: place.id,
          animation: google.maps.Animation.DROP
        });
        marker.place=place;
        marker.navigateEnabled=ko.observable(false);
         // Push the marker to our array of markers.
          self.markers.push(marker);
       // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow);
            self.markers().forEach( function(e) {
              (e.id===marker.id)?e.navigateEnabled(true):e.navigateEnabled(false);
            });
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to make the marker bounce or not.
          marker.addListener('mouseover', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
          });
          marker.addListener('mouseout', function() {
            this.setAnimation(null);
          });

      };

         // This function will loop through the place markers and hide them all.
       self.hide=function() {
        // for (var i = 0,len=self.markers().length; i < len; i++) {
        //   self.markers()[i].setMap(null);
        // }
        self.markers().forEach( function(marker) {
          marker.setMap(null);
        });
      };

      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
       self.populateInfoWindow=function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the yelp time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var place=marker.place,
          content='<div class="info"><section class="info-left">';
          if(place.image_url){
            content+='<img src="'+place.image_url+'">';
          }
          content+='</section><section class="info-right">';
          if(place.name){
            content+='<div class="info-name">';
            content+=(place.url)?'<a class="info-link" href="'+place.url+'">'+place.name+'</a></div>':place.name+'</div>';
          }
          if(place.location.address){
              content+='<div class="info-addr">'+place.location.address+'</div>';
          }
          content+='<div class="info-rating">';
          if(place.rating_img_url){
            content+='<img class="info-rating-left" src="'+place.rating_img_url+'">';
          }
          content+='<a href="https://www.yelp.com"><img class="info-yelp" src="img/yelp.png"></a></div>';
          if(place.review_count){
            content+='<div class="info-review">Based on '+place.review_count+' reviews</div>';
          }
           if(place.categories){
            var categories_arr=[];
            place.categories.forEach( function(e) {
              categories_arr.push(e[0]);
            });
            var categories=categories_arr.slice(0,2).join(',');
            content+='<div class="info-cate">'+categories+'<div>';
           }
           content+='</section></div>';
          // }

          infowindow.setContent(content);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      };
};
var CenterMarker=function () {
  var self=this;
  self.marker=ko.observable();

  self.create=function(place) {
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

 var ViewModel=function () {
      var self=this;
      self.btn=ko.observable(false);
     // self.list=ko.observableArray([]);
     // self.centerMarker=ko.observable();
      self.title=ko.observable('your favourite!');
      self.center=ko.observable('');
      self.querystr=ko.observable('');
      //self.selectedMarker=ko.observable();
      self.showDirections=ko.observable(false);
      self.mapError=ko.observable(false);
      self.yelpError=ko.observable(false);
      self.directionsError=ko.observable(false);
      self.searchEmpty=ko.observable(false);
      self.searchFailed=ko.observable(false);
      self.locationError=ko.observable(0);
      self.terms=ko.observableArray(['food','restaurants','active life','medical']);
      self.mode=ko.observableArray([]);
      modes.forEach( function(e,i) {
        var mode={};
        mode.text=e;
        mode.selected=ko.observable(false);
        self.mode.push(mode);
      });
      self.mode()[0].selected(true);
      self.toggleBtn=function () {
        self.btn(!self.btn());
      };
      self.list=ko.computed(function () {
        if($.trim(self.querystr()).length==0){
          return pm.markers();
        }else {
          return ko.utils.arrayFilter(pm.markers(), function(marker) {
            return marker.title.toLowerCase().indexOf(self.querystr().toLowerCase())>-1;
        });
        }
      });
            // This function will loop through the markers array and display them all.
       self.showListings=function() {
        var bounds = new google.maps.LatLngBounds(),
        // Extend the boundaries of the map for each marker and display the marker
        markers=self.list(),
        len=markers.length;
        if(len===0) {
          return;
        }
        for (var i = 0; i < len; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      };

      self.filter=function () {
        pm.hide();
        self.showListings();
      };
      // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
      self.myPosition=function () {

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            initial.lat=position.coords.latitude;
            initial.lng=position.coords.longitude;
            searchPlaces({location:initial});
            self.locationError(0);
          }, function() {
            self.locationError(1);
          });
        } else {
          // Browser doesn't support Geolocation
          self.locationError(2);
        }
      };
      self.termSerach=function (term) {
        searchPlaces({address:self.center()},term);
      };

      self.listMouseOver=function (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      };
      self.listMouseOut=function (marker) {
        marker.setAnimation(null);
      };
      self.listClick=function (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        pm.populateInfoWindow(marker, largeInfowindow);
        self.list().forEach( function(e) {
          e.navigateEnabled(false);
        });
        marker.navigateEnabled(true);
      };

      self.navigate=function (marker) {
        pm.selected(marker);
        self.showDirections(true);
        self.displayDirections(self.mode()[0]);
      }

      self.displayDirections=function (mode) {
         pm.hide();
         cm.marker().setMap(null);
         self.mode().forEach( function(e) {
               e.selected(false);
            });
              mode.selected(true);
        var directionsService = new google.maps.DirectionsService;
          if (typeof(directionsDisplay)!='undefined'){
                directionsDisplay.setMap(null);
                directionsDisplay.setPanel(null);
            }
          var request={
          // The origin is the canter marker's position.
          origin: cm.marker().position,
          destination: pm.selected().position,

          travelMode: google.maps.TravelMode[mode.text.toUpperCase()]
          //travelMode: google.maps.TravelMode.DRIVING
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
              //panel:document.getElementById('mode'+(i+1))
              panel:document.getElementById('panel')
            });
          } else {
            //window.alert('Directions request failed due to ' + status);
            vm.directionsError(true);
          }
        });
      }

      self.hideDirections=function () {
        self.showDirections(false);
        cm.marker().setMap(map);
        if (typeof(directionsDisplay)!='undefined'){
                directionsDisplay.setMap(null);
                directionsDisplay.setPanel(null);
            }
        self.showListings();
      }
      };

      var cm=new CenterMarker();
      var pm=new PlaceMarkers();
      var vm=new ViewModel();
      ko.applyBindings(vm);

//Create a map variable
     var map;
      // Create a new blank array for all the listing markers.
      var markers = [];
      // Create placemarkers array to use in multiple functions to have control
      // over the number of places that show.

     //Initialize the map
     function initMap() {

      var sv={lat:37.387474,lng:-122.057543},latlng={lat:0,lng:0};
       //  Create a new map center in Silicon Valley.
       map=new google.maps.Map(document.getElementById('map'),{
          center:sv,
          zoom:13
       });

       var request = {
        location: sv,
        radius: '5000',
      };

     // service = new google.maps.places.PlacesService(map);
     // service.nearbySearch(request, nearbyCallback);

      function nearbySearch(results) {
        vm.list.removeAll();
        var all=results.businesses;
        all.forEach( function(place) {
          createMarker(place);
        });
        // for (var i = 0,len=all.length; i < len; i++) {
        //   if(typeof(all[i].location.coordinate)== "undefined")
        //     continue;
        //   latlng.lat=all[i].location.coordinate.latitude;
        //   latlng.lng=all[i].location.coordinate.longitude;
        //   console.log(latlng);
        //   (results.businesses[i]);
          //console.log(all[i].location.coordinate);
        //}
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

    var parameters = {
      oauth_consumer_key: yelp_key,
      oauth_token: yelp_token,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb',              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
      location:'Silicon+Valley',
      // cll:sv.lat+','+sv.lng,
    };

    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, yelp_key_secret, yelp_token_secret);
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        // Do stuff with results
        nearbySearch(results);
       // console.log(results.businesses[0].location.coordinate);

      },
      fail: function(xhr, status, error) {
      // Do stuff on fail
      console.log("An AJAX error occured: " + status + "\nError: " + error + "\nError detail: " + xhr.responseText);
    }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);



       // Create a searchbox in order to execute a places search
        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));
        // Bias the searchbox to within the bounds of the map.
        searchBox.setBounds(map.getBounds());

       var largeInfowindow = new google.maps.InfoWindow();

         function createMarker(place) {
        //var placeLoc = place.geometry.location;
        // var icon = {
        //     url: place.icon,
        //     size: new google.maps.Size(35, 35),
        //     origin: new google.maps.Point(0, 0),
        //     anchor: new google.maps.Point(15, 34),
        //     scaledSize: new google.maps.Size(25, 25)
        //   };
        //console.log(place.location);
        //console.log(place.location.coordinate);
        //latlng.lat=place.location.coordinate.latitude;
        //latlng.lng=place.location.coordinate.longitude;
        var coordinate=place.location.coordinate;
        if(typeof(coordinate)== "undefined"){
          return;
        }
        latlng.lat=coordinate.latitude;
        latlng.lng=coordinate.longitude;
        var marker = new google.maps.Marker({
          map: map,
          position: latlng,
          //label: labels[labelIndex++ % labels.length],
          title: place.name,
          //console.log(place.name);
          //icon: icon,
          id: place.id,
          animation: google.maps.Animation.DROP
        });
         // Push the marker to our array of markers.
          //markers.push(marker);
          vm.list.push(marker);
       // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this,place, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to make the marker bounce or not.
          marker.addListener('mouseover', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
          });
          marker.addListener('mouseout', function() {
            this.setAnimation(null);
          });

      }

      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker,place, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the yelp time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var name=place.name,
          address=place.location.address,
          img=place.image_url,
          rating_img=place.rating_img_url,
          //rating_img_small=place.rating_img_url_small,
          //rating_img_large=place.rating_img_url_large,
          review_count=place.review_count;
          var content='<div class="info"><section class="info-left">'+'<img src="'+img+'">'+'</section>'+'<section class="info-right">'+
            '<div class="info-name">'+name+'</div>'+'<div class="info-addr">'+address+'</div>'+
            '<div class="info-rating">'+
            '<img class="info-rating-left" src="'+rating_img+'">'+
            '<img class="info-yelp" src="img/yelp.png"></div>'+
            '<div class="info-review">Based on '+review_count+' reviews</div>'+
          '</section></div>';
          infowindow.setContent(content);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }




    var ViewModel=function () {
      var self=this;
      self.list=ko.observableArray([]);
      self.listMouseOver=function (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);

      }
      self.listMouseOut=function (marker) {
        marker.setAnimation(null);
      }
      };
      vm = new ViewModel();
      ko.applyBindings(vm);
}

function googleError(){
  alert('failed!');
}



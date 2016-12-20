//Create a map variable
     var map;
      // Create a new blank array for all the listing markers.
      var markers = [];
      // Create placemarkers array to use in multiple functions to have control
      // over the number of places that show.

     //Initialize the map
     function initMap() {

      var sv={lat:37.387474,lng:-122.057543},
       //  Create a new map center in Silicon Valley.
       map=new google.maps.Map(document.getElementById('map'),{
          center:sv,
          zoom:13
       });

       var request = {
        location: sv,
        radius: '5000',
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, nearbyCallback);




       // Create a searchbox in order to execute a places search
        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));
        // Bias the searchbox to within the bounds of the map.
        searchBox.setBounds(map.getBounds());

       var largeInfowindow = new google.maps.InfoWindow();

       // Style the markers a bit. This will be our listing marker icon.
        //var defaultIcon = makeMarkerIcon('0091ff');

         // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        //var highlightedIcon = makeMarkerIcon('FFFF24');

         function createMarker(place) {
        //var placeLoc = place.geometry.location;
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
          };
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          //label: labels[labelIndex++ % labels.length],
          title: place.name,
          icon: icon,
          id: place.place_id,
          animation: google.maps.Animation.DROP
        });
         // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker
        google.maps.event.addListener(marker, 'click', function() {
          largeInfowindow.setContent(place.name);
          largeInfowindow.open(map, this);
        });
      }

      function nearbyCallback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
      }
    }

    var ViewModel=function () {
      var self=this;
      self.list=ko.observableArray([]);
      // Here's the problem:the markers array is empty when executing this function,
      //after a few seconds it's not empty,however the list shows nothing。
      markers.forEach( function(marker) {
            self.list.push(marker.title);
            console.log(marker.title);
        });
      };
      vm = new ViewModel();
      ko.applyBindings(vm);
}

function googleError(){
  alert('failed!');
}



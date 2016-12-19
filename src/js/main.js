//Create a map variable
     var map;
      // Create a new blank array for all the listing markers.
      var markers = [];
      // Create placemarkers array to use in multiple functions to have control
      // over the number of places that show.
      var placeMarkers = [];
     //Initialize the map
     function initMap() {

      var sv={lat:37.387474,lng:-122.057543};
       //  Use a constructor to create a new map JS object.
       map=new google.maps.Map(document.getElementById('map'),{
          center:sv,
          zoom:13
       });
       // Create a searchbox in order to execute a places search
        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));
        // Bias the searchbox to within the bounds of the map.
        searchBox.setBounds(map.getBounds());

       var largeInfowindow = new google.maps.InfoWindow();

       // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('0091ff');

         // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');
     }

// var ViewModel=function () {
//   var self=this;

// }

// ko.applyBindings(new ViewModel());

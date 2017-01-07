###Udacity Front-End Web Developer Nanodegree – Project 05


# Neighborhood Map

### Get started

- Download the project from Github and open dist/index.html.
- You need an active internet connection since project uses 3rd party api.
- Click on hamburger icon to display the menu,the map and menu will initial display the business places around Silcon Valley.You can type in location name in the "Near" box or click on "Get my location" to search for your interested places or get your own location.

### Build Tool

- Using Grunt to compress images and minify js,css,html files.The source codes are in src file and the processed codes are in dist file.In order to use grunt,you need to install [nodejs](https://nodejs.org/en/) first and then Grunt.

``` bash
npm install -g grunt-cli
cd /path/to/your-project-folder
npm install grunt --save-dev
npm install --save-dev grunt-contrib-clean grunt-contrib-imagemin grunt-contrib-cssmin grunt-contrib-uglify grunt-contrib-htmlmin
grunt
```

### Map's Functionality

- **header**

  - Hamburger icon: Toggle the display of the menu.

- **Map**

  - Zoom in and out, clickable icons on the map
  - Markers will be displayed if they are selected on the menu list or map.The center location marker is blue while the business place maekers are red. Click red markers to display the infowindow showing the business information of the place: name, image, address, yelp rating and review count. Besides,you can click the place name to jump to business information on the yelp.

- **Menu**

  - "Find": If you have searched for location and there are places on the list,you can type in this box to filter the places based on their name.
  - "Near": Search for your favourite locations in this field (e.g. "New York","Miami Beach"), which has autocomplete function so that you can select a prediction from the picklist.
  - "How about nearby..": Four terms to choose for searching around the location: food, restaurants, active life and medical.
  - "Get my location": Upon click,the browser will inform you the application wants to get your position, just allow it and the map will center in your location.Notice that some browsers doesn't support this function.
  - "Do you want to find..": Here shows the business places from yelp around the location you choose. (Notice that yelp business is not available in some countries.)Upon the click on place name, marker will display ,infowindow and navigate button (a paper plane icon) will show up. Once clicked the button, the navigation will show up on the map and Menu. You have four travel modes to choose: Driving (the default), walking, bicycling, transit. Navigation panel can be closed by X button.


### Third party services used in the project:


- [Google Maps](https://developers.google.com/maps/documentation/javascript/)
- [Yelp](https://www.yelp.com/developers/v2)

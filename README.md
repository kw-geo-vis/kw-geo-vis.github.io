# KEYvis: Visualising Geological Data in the Keyworth Area

This is the code repository for Andrew Bean's submission for the Geospatial Applications Developer Assignment.

The produced responsive website can be viewed at https://kw-geo-vis.github.io/

## Features

All aspects of the specification have been completed with data from the provided files displayed on a simple map interface which includes location search functionality.

![KEYvis main functionality](https://kw-geo-vis.github.io/imgs/data.gif | width=300)

Additionally, data overlays for BGS data sources displaying Bedrock, Superficial Deposits and Artificial ground can be toggled on and off and the associated data record accessed.

![KEYvis additional functionality](https://kw-geo-vis.github.io/imgs/extra-data.gif | width=300)

The site is a responsive web-based application which is equally functional on large displays and mobile devices.

![KEYvis responsive layout](https://kw-geo-vis.github.io/imgs/responsive.gif | width=300)

## Code Structure

* There is one HTML index file which is located in the project [root](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/).
* Authored javascript is located in the [scripts](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/scripts) directory.
* Authored SCSS is located in the [scss](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/scss) directory.
* Provided data CSV files are stored and parsed from the [data](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/data) directory.
* Compiled and minified CSS and JS files for the live site are located in the [css](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/css) and [js](https://github.com/kw-geo-vis/kw-geo-vis.github.io/tree/master/js) directories.

## Future Features

Some possible feature extensions to the application which have not yet been implemented are listed below:

* Facility to upload and visualise additional data files with new data.  CSV files are already parsed and displayed on request so will not be complicated.
* Geolocation to display a pointer showing the user's current location (particularly beneficial on mobile).
* Caching of data and map tiles using IndexedDB, localStorage etc. to allow the application to be used without an internet connection (e.g. in the field).
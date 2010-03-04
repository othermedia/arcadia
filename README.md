Arcadia
=======

Arcadia is a full-width image gallery written in JavaScript.


Todo
----

* Improve configuration options for the gallery and items
* Add support for item types other than images
* Descriptions aren't showing in Safari
* Fix async load bugs


Dependencies
------------

Running the test suite requires the [JSON gem][json], as well as [Jake][jake].
To get them just run the following command (with `sudo` if you prefer).

    gem install json jake

The gallery itself relies on [Ojay][ojay] (and therefore [YUI][yui] and
[JS.Class][jsclass]); its dependencies, and the objects it provides, are listed
in the `jake.yml` file.


  [json]:     http://flori.github.com/json
  [jake]:     http://github.com/jcoglan/jake
  [ojay]:     http://ojay.othermedia.org
  [yui]:      http://developer.yahoo.com/yui/2/
  [jsclass]:  http://jsclass.jcoglan.com/

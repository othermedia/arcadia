Arcadia
=======

Arcadia is a full-width image gallery written in JavaScript.


Todo
----

* Fix description insertion: HTML should not be escaped
* Splicing sometimes results in empty spaces appearing before the centring
  animation is run; this needs to be fixed.
* Resizing the window while the gallery is animating can result in the test
  controls being incorrectly repositioned.


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

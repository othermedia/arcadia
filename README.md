Arcadia
=======

Arcadia is a full-width image gallery written in JavaScript.


Todo
----

* Fix description display
* Allow `Items` to be arguments of `Arcadia#centreOn`. This would remove some
  accidental complexity (depending on array indices to determine which item to
  centre is tightly-coupled and fragile).
* Rename `this._current` in instances of the `Arcadia` object to `this._centre`
  to better reflect its nature.
* Add `Arcadia.Controls.Next` for next and previous buttons.


Dependencies
------------

Running the test suite requires the [JSON gem][json], as well as [Jake][jake].
To get them just run the following command (with `sudo` if you prefer).

    gem install json jake

The gallery itself relies on [Ojay][ojay] (and therefore [YUI][yui] and
[JS.Class][jsclass]), as well as two other libraries: [Edgecase][edgecase] and
[Scaling Slider][slider].


  [json]:     http://flori.github.com/json
  [jake]:     http://github.com/jcoglan/jake
  [ojay]:     http://ojay.othermedia.org
  [yui]:      http://developer.yahoo.com/yui/2/
  [jsclass]:  http://jsclass.jcoglan.com/
  [edgecase]: http://github.com/othermedia/edgecase
  [slider]:   http://github.com/othermedia/scaling-slider

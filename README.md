Arcadia
=======

Arcadia is a full-width image gallery with a variety of control types,
including thumbnails, next and previous buttons, and a play/pause control to
make the gallery rotate without further user input.

It was developed for the [Paul Smith collections][ps] website, but is now open
source software released under the BSD license.


Dependencies
------------

Running the test suite requires the [JSON gem][json], as well as [Jake][jake].
To get them just run the following command (with `sudo` if you prefer).

    gem install json jake

The gallery itself relies on [Ojay][ojay] (and therefore [YUI][yui] and
[JS.Class][jsclass]); its dependencies, and the objects it provides, are listed
in the `jake.yml` file.


Usage
-----

### Gallery description

The contents of each gallery need to be provided as an object with `title`,
`description` and `items` fields; each item must contain sufficient data to
construct an image, and potentially thumbnails and other control structures.
Here's an example of a gallery containing just one item.

    var description = {
        "title":       "Example gallery",
        "description": "A description of the gallery contents",
        "items":       [
            {
                "name":        "Example item",
                "description": "A description of the item",
                
                "image":       {
                    "uri":    "images/image01.jpg",
                    "width":  300,
                    "height": 500
                },
                
                "thumbnail":   {
                    "uri":    "images/thumbnail01.jpg",
                    "width":  60,
                    "height": 100
                }
            }
        ]
    };

This description can also be provided as JSON, in which case it will be parsed
by the `Arcadia` constructor

### Creating a new gallery

To set up a new gallery, just create a new instance of the `Arcadia` class,
passing in the container which the gallery should be inserted into and the
description. The container can be provided as a CSS selector, an `HTMLELement`
reference or an Ojay collection.

    var gallery = new Arcadia('#gallery', description);

This will immediately generate a new gallery and insert it into the DOM.

### Adding controls

Arcadia comes with several sets of controls: thumbnails, a play/pause button,
and next and previous buttons. To add a particular control, just call the
gallery's `addControls` method, passing in the control class.

    var next = gallery.addControls(Arcadia.Controls.Next);
    
    gallery.getHTML().insert(next.getHTML(), 'after');

All the control classes use the public `Arcadia` API, so writing new controls
is quite straightforward. Three control classes come with the library:

* `Arcadia.Controls.Thumbnails` generates a set of thumbnails, which, when
  clicked on, centre the gallery on the relevant image. This requires the
  thumbnail property of each element to be set.
* `Arcadia.Controls.Play` provides a play/pause button that when clicked,
  centres the gallery on the next item, and starts a timer that---until another
  control is used---goes to the next item every few seconds.
* `Arcadia.Controls.Next` adds 'Next' and 'Previous' buttons that centre the
  gallery on the next or previous image.

### Serving with Helium

This library contains a `jake.yml` file that specifies its dependencies and the
objects it provides, and is thus easily served with [Helium][helium]. Just add
the name of this repository to your `deploy.yml` file, and when you want to use
Arcadia in a web page, simply `require` it as you would any other
Helium-enabled library.

    require('Arcadia', function() {
        var gallery = new Arcadia('#gallery', description);
    });


Limitations
-----------

Galleries created with Arcadia tend to behave a little strangely when there
aren't enough items to fill the browser viewport. As viewports vary in size
from the very big to the very small, in practice this tends to mean that
galleries need quite a few elements.

It's also worth noting that while Arcadia will cope with heterogenous widths,
this will make the sides uneven in physical (pixel) width, as the balancing
algorithm merely relies on the number of elements, not their size relative to
one another. For this reason, galleries tend to look and work better when the
contents are all of the same size, or at least are relatively similar in this
regard.


Future development
------------------

The following is a sketch of future development which could improve the
library.

### More flexible `addControls` method

Arguments to the `Arcadia#addControls` method after the class name could be
passed through to the class constructor, enabling more complex behaviours.

### A choice of direction for `Arcadia.Controls.Play`

Currently the gallery will shift its focus to the next image with each 'tick'
of the timer. The direction could be turned into an option, and it could centre
on the previous image rather than the next one.

### Renaming the `Arcadia` class

A breaking API change: rename the `Arcadia` class to `Arcadia.Gallery`, and
reserve `Arcadia` as a namespace. This might make future expansion of the
library easier, and allow for the splitting of the monolithic `Arcadia` class
into smaller logical components.

### Vertical galleries

Currently the axis of travel in Arcadia galleries is restricted to the
horizontal. Allowing vertical galleries would be a big leap in capability.

### CSS transform and transition animation backend

The image container element is currently positioned absolutely, by setting its
`left` and `right` properties. By swapping this---and Ojay's default,
YUI-backed animation framework---out for CSS transforms and transitions where
available, we might see some performance improvements, in terms of the
smoothness of animations. Given the restricted use case, with no need for
overshoots or non-linear animation functions, this would fit well with the
limitations of CSS transform and transition-based animations.

### ARIA notifications

Notifying the browser when the display changed would be a major accessibility
improvement.

### Keyboard-accessible controls

Making all control elements into e.g. `button` elements, as seen in our
[YouTube player][youtube], would make them accessible to keyboard users.


  [json]:     http://flori.github.com/json
  [jake]:     http://github.com/jcoglan/jake
  [ojay]:     http://ojay.othermedia.org
  [yui]:      http://developer.yahoo.com/yui/2/
  [jsclass]:  http://jsclass.jcoglan.com/
  [ps]:       http://www.paulsmith.co,uk
  [helium]:   http://github.com/othermedia/helium
  [youtube]:  http://github.com/othermedia/youtube

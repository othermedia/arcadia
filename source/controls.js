Arcadia.Controls = {
    Thumbnails: new JS.Class('Arcadia.Controls.Thumbnails', {
        initialize: function(gallery) {
            this._gallery = gallery;
            this._current = null;
            
            this._gallery.on('centreStart', this.setCurrent, this);
        },
        
        setCurrent: function(gallery, item) {
            var current = this._thumbs.get(item);
            
            if (current === this._current) return;
            
            this._current.removeClass('selected');
            current.addClass('selected');
            
            this._current = current;
        },
        
        getHTML: function() {
            if (this._html) return this._html;
            
            this._html = Ojay(Ojay.HTML.div({className: 'arcadia-thumbnails'}));
            
            this._thumbs = this._gallery.getItems().reduce(function(hash, item) {
                var thumb = item.getThumbnail();
                
                if (item === this._gallery.getCentre()) {
                    this._current = thumb;
                    thumb.addClass('selected');
                }
                
                this._html.insert(thumb, 'bottom');
                
                thumb.on('click', function() {
                    this._gallery.centreOn(item, this);
                }, this);
                
                hash.store(item, thumb);
                
                return hash;
            }.bind(this), new JS.Hash());
            
            return this._html;
        }
    }),
    
    Play: new JS.Class('Arcadia.Controls.Play', {
        initialize: function(gallery, options) {
            this._gallery = gallery;
            this._playing = false;
            this._timer   = null;
            
            // The options parameter could be an array passed through by the
            // Arcadia#addControls method, or just a normal argument.
            if (typeof options == 'object') {
                if (options instanceof Array) options = options[0] || {};
            } else {
                options = {};
            }
            
            this._direction = options.direction == 'previous' ? 'previous' : 'next';
            
            this._gallery.on('centreStart', function(gallery, item, controller) {
                if (!(controller && controller.isA(this.klass))) {
                    this.pause();
                }
            }, this);
        },
        
        play: function() {
            this._timer = setInterval(function() {
                this._gallery[this._direction](this);
            }.bind(this), 3000);
            
            this._gallery[this._direction](this);
            
            if (this._html) {
                this._html.replaceClass('paused', 'playing').setContent('Pause');
            }
            
            this._playing = true;
        },
        
        pause: function() {
            clearInterval(this._timer);
            
            if (this._html) {
                this._html.replaceClass('playing', 'paused').setContent('Play');
            }
            
            this._playing = false;
        },
        
        toggle: function() {
            this[this._playing ? 'pause' : 'play']();
        },
        
        getHTML: function() {
            if (this._html) return this._html;
            
            this._html = Ojay(Ojay.HTML.div({
                className: 'arcadia-play-button ' + (this._playing ? 'playing' : 'paused')
            }, (this._playing ? 'Pause' : 'Play')));
            
            this._html.on('click', this.toggle, this);
            
            return this._html;
        }
    }),
    
    Next: new JS.Class('Arcadia.Controls.Next', {
        initialize: function(gallery) {
            this._gallery = gallery;
        },
        
        previous: function() {
            this._gallery.previous(this);
        },
        
        next: function() {
            this._gallery.next(this);
        },
        
        getHTML: function() {
            if (this._html) return this._html;
            
            var self = this;
            self._html = Ojay(Ojay.HTML.div({className: 'arcadia-next-previous'}, function(H) {
                self._previous = Ojay(H.span({className: 'previous'}, 'Previous'));
                self._next     = Ojay(H.span({className: 'next'}, 'Next'));
            }));
            
            this._previous.on('click', this.previous, this);
            this._next.on('click', this.next, this);
            
            return this._html;
        },
        
        getPrevious: function() {
            return this._previous;
        },
        
        getNext: function() {
            return this._next;
        },
        
        getGallery: function() {
            return this._gallery;
        }
    })
};

Arcadia = new JS.Class('Arcadia', {
    initialize: function(container, json) {
        var x = 0, y = 0;
        
        this._container = Ojay(container);
        this._viewport  = Ojay(Ojay.HTML.div({className: 'viewport'}));
        
        this._container.children().remove()
        ._(this._container).insert(this._viewport, 'after')
        ._(this._viewport).setContent(this._container);
        
        this._items = new this.klass.ModNList(json.images.map(function(img, i) {
            var item = new this.klass.Item(this, img);
            
            this._container.insert(item.getHTML(), 'bottom');
            
            item.getHTML().on('click', function() {
                this.centreOn(i);
            }, this);
            
            x += img.width;
            
            if (img.height > y) {
                y = img.height;
            }
            
            return item;
        }, this));
        
        this._current = Math.floor((this._items.n() - 1) / 2);
        this._left    = 0;
        
        this._viewport.setStyle({
            position: 'relative',
            height:   y + 'px'
        });
        
        this._container.setStyle({
            width:    x + 'px',
            height:   y + 'px',
            position: 'absolute',
            top:      0,
            left:     this.getOffset() + 'px'
        });
        
        Ojay(window).on('resize', this.fitToViewport, this);
    },
    
    addControls: function(klass) {
        return new (klass || this.klass.Controls.Thumbnails)(this);
    },
    
    getThumbnails: function() {
        return this._items.map(function(item) {
            return item.getThumbnail();
        });
    },
    
    fitToViewport: function() {
        this._container.setStyle({left: this.getOffset() + 'px'});
    },
    
    balance: function(index) {
        var oldLeft, newLeft, splicees, shiftRight, offset;
        
        oldLeft = this._left;
        newLeft = this._items.mod(oldLeft + index - this._current);
        
        // This block is broken
        if (this._current > oldLeft) {
            shiftRight = index > oldLeft && index < this._current;
        } else {
            shiftRight = index > this._current && index < oldLeft;
        }
        
        if (shiftRight) {
            splicees = this._items.slice(newLeft, oldLeft);
            offset   = this.spliceLeft(splicees.reverse());
        } else {
            splicees = this._items.slice(oldLeft, newLeft);
            offset   = this.spliceRight(splicees);
        }
        
        this._container.setStyle({
            left: (this.getOffset() - offset) + 'px'
        });
        
        this._left = newLeft;
    },
    
    spliceRight: function(items) {
        return items.reduce(function(offset, item) {
            this._container.insert(item.getHTML(), 'bottom');
            return offset - item.getWidth();
        }.bind(this), 0);
    },
    
    spliceLeft: function(items) {
        return items.reduce(function(offset, item) {
            this._container.insert(item.getHTML(), 'top');
            return offset + item.getWidth();
        }.bind(this), 0);
    },
    
    getOffset: function() {
        var portWidth, itemsWidth, currentWidth, offset;
        
        portWidth    = this._viewport.getWidth();
        itemsWidth   = this.getWidth();
        currentWidth = this._items.at(this._current).getWidth();
        // Dodgy assumption at play: all items have same width
        offset       = Math.floor((portWidth + currentWidth - itemsWidth) / 2);
        
        return offset;
    },
    
    getWidth: function() {
        return this._items.reduce(function(width, item) {
            return width + item.getWidth();
        }, 0);
    },
    
    centreOn: function(index) {
        if (this._current === index) return;
        
        this.balance(index);
        
        this._container.animate({
            left: {
                to: this.getOffset()
            }
        });
        
        this._current = index;
    },
    
    next: function() {
        this.centreOn(this._items.add(this._current, 1));
    },
    
    previous: function() {
        this.centreOn(this._items.subtract(this._current, 1));
    },
    
    getHTML: function() {
        return this._viewport;
    },
    
    extend: {
        ModNList: new JS.Class('ModNList', {
            initialize: function(items) {
                this._store = items || [];
            },
            
            n: function() {
                return this._store.length;
            },
            
            at: function(i) {
                return this._store[this.mod(i)];
            },
            
            mod: function(a) {
                var n = this._store.length, m = a % n;
                return m < 0 ? n + m : m;
            },
            
            add: function(a, b) {
                return this.mod(a + b);
            },
            
            subtract: function(a, b) {
                return this.mod(a - b);
            },
            
            slice: function(start, end) {
                var s1, s2, sliced;
                
                start = this.mod(start);
                end   = this.mod(end);
                
                if (start > end) {
                    s1     = this._store.slice(start);
                    s2     = this._store.slice(0, end);
                    sliced = s1.concat(s2);
                } else {
                    sliced = this._store.slice(start, end);
                }
                
                return sliced;
            },
            
            map: function(block, context) {
                return this._store.map(block, context);
            },
            
            reduce: function(block, context) {
                return this._store.reduce(block, context);
            }
        }),
        
        Item: new JS.Class({
            initialize: function(gallery, spec) {
                this._gallery = gallery;
                this._spec    = spec;
            },
            
            getHTML: function() {
                if (this._html) return this._html;
                
                var self = this;
                self._html = Ojay(Ojay.HTML.div({className: 'item'}, function(H) {
                    self._image = Ojay(H.img({
                        alt: self._spec.name,
                        src: self._spec.uri
                    }));
                    
                    self._descWrapper = Ojay(H.div({className: 'description-wrapper'}, function(W) {
                        self._descToggle  = Ojay(W.div({className: 'description-toggle'}, 'More'));
                        self._description = Ojay(W.div({className: 'description'}, self._spec.description));
                    }));
                }));
                
                this._html.setStyle({
                    width:    this._spec.width  + 'px',
                    height:   this._spec.height + 'px',
                    overflow: 'hidden',
                    position: 'relative'
                });
                
                this._descWrapper.setStyle({
                    position: 'absolute',
                    left:   0,
                    bottom: 0,
                    width:  this._spec.width + 'px'
                });
                
                this._descMaxHeight = this._descWrapper.getHeight();
                this._description.hide();
                this._descMinHeight = this._descWrapper.getHeight();
                this._descWrapper.setStyle({
                    overflow: 'hidden',
                    height:   this._descMinHeight + 'px'
                });
                this._description.show();
                
                this._descriptionCollapsed = true;
                
                this._descToggle.on('click', function(el, evnt) {
                    this[this._descriptionCollapsed ? 'expandDescription' : 'collapseDescription']();
                }, this);
                
                return this._html;
            },
            
            getWidth: function() {
                return this._spec.width;
            },
            
            hideDescription: function() {
                this._descWrapper.hide();
            },
            
            showDescription: function() {
                this._descWrapper.show();
            },
            
            collapseDescription: function() {
                this._toggleDescription(this._descMaxHeight, this._descMinHeight, 'More');
            },
            
            expandDescription: function() {
                this._toggleDescription(this._descMinHeight, this._descMaxHeight, 'Close');
            },
            
            _toggleDescription: function(startHeight, finishHeight, toggleText) {
                this._descWrapper.animate({
                    height: {
                        from: startHeight,
                        to:   finishHeight
                    }
                }, 0.3)
                ._(this._descToggle).setContent(toggleText)
                ._(function() {
                    this._descriptionCollapsed = !this._descriptionCollapsed;
                }.bind(this));
            },
            
            getThumbnail: function() {
                if (this._thumbnail) return this._thumbnail;
                
                var self = this;
                self._thumbnail = Ojay(Ojay.HTML.div({className: 'thumbnail'}, function(H) {
                    H.img({
                        alt: self._name,
                        src: self._spec.thumbnail.uri
                    });
                }))
                .setStyle({
                    width:  self._spec.thumbnail.width  + 'px',
                    height: self._spec.thumbnail.height + 'px'
                });
                
                return this._thumbnail;
            }
        }),
        
        Controls: {
            Thumbnails: new JS.Class('Arcadia.Controls.Thumbnails', {
                initialize: function(gallery) {
                    this._gallery = gallery;
                    this._thumbs  = this._gallery.getThumbnails();
                },
                
                getHTML: function() {
                    if (this._html) return this._html;
                    
                    this._html = Ojay(Ojay.HTML.div({className: 'thumbnails'}));
                    
                    this._thumbs.forEach(function(thumb, i) {
                        this._html.insert(thumb, 'bottom');
                        
                        thumb.on('click', function() {
                            this._gallery.centreOn(i);
                        }, this);
                    }, this);
                    
                    // this._slider = new ScalingSlider(this._html, {
                    //     direction: 'horiztonal'
                    // });
                    
                    return this._html;
                }
            }),
            
            Play: new JS.Class('Arcadia.Controls.Play', {
                initialize: function(gallery) {
                    this._gallery = gallery;
                    this._playing = false;
                    this._timer   = null;
                },
                
                play: function() {
                    this._timer = setInterval(function() {
                        this._gallery.next();
                    }.bind(this), 3000);
                    
                    this._gallery.next();
                    
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
                        className: 'play-button ' + (this._playing ? 'playing' : 'paused')
                    }, (this._playing ? 'Pause' : 'Play')));
                    
                    this._html.on('click', this.toggle, this);
                    
                    return this._html;
                }
            })
        }
    }
});

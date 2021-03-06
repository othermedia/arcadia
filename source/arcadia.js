 /**
 * Arcadia is a full-width media gallery with a variety of control types,
 * including thumbnails, next and previous buttons, and a play/pause control to
 * make the gallery rotate without further user input.
 */
Arcadia = new JS.Class('Arcadia', {
    include: [JS.State, Ojay.Observable],
    
    initialize: function(container, description) {
        if (typeof description == 'string') description = description.parseJSON();
        
        var x = 0, y = 0, items, right, left;
        
        this._container = Ojay(container);
        this._viewport  = Ojay(Ojay.HTML.div({className: 'viewport'}));
        
        this._container.children().remove()
        ._(this._container).insert(this._viewport, 'after')
        ._(this._viewport).setContent(this._container);
        
        this._centre = 0;
        this._left   = Math.ceil((description.items.length + 1) / 2);
        
        items = description.items.map(function(item, i) {
            item = new this.klass.Item(this, item);
            
            x += item.getWidth();
            
            if (item.getHeight() > y) {
                y = item.getHeight();
            }
            
            return item;
        }, this);
        
        this._items = new this.klass.ModNList(items);
        
        right = items.slice(this._left);
        left  = items.slice(this._centre, this._left);
        
        right.concat(left).forEach(function(item, i) {
            this._container.insert(item.getHTML(), 'bottom');
            item.representation().on('ready', function(rep) {
                if (item === this.getCentre()) {
                    rep.show({animate: false});
                }
            }, this);
        }, this);
        
        this._viewport.setStyle({
            position: 'relative',
            height:   y + 'px'
        });
        
        this._container.setStyle({
            width:    x + 'px',
            height:   y + 'px',
            position: 'absolute',
            top:      0,
            left:     this.getLeftOffset() + 'px'
        });
        
        Ojay(window).on('resize', this.fitToViewport, this);
        
        this.on('centreEnd', this.fireQueue, this);
        
        this.setState('READY');
    },
    
    addControls: function(klass) {
        var args = Array.prototype.slice.call(arguments, 1);
        return new (klass || this.klass.Controls.Thumbnails)(this, args);
    },
    
    getItems: function() {
        return this._items;
    },
    
    getCentre: function() {
        return this._items.at(this._centre);
    },
    
    _unbalance: function(centre, shiftRight) {
        var oldLeft, newLeft, items, splicees, clones, containerStyle, offset;
        
        oldLeft = this._left;
        newLeft = this._items.mod(oldLeft + centre - this._centre);
        
        containerStyle = {};
        
        if (shiftRight) {
            items = this._items.slice(newLeft, oldLeft);
        } else {
            items = this._items.slice(oldLeft, newLeft);
        }
        
        offset   = this.klass.getWidth(items);
        splicees = items.map(function(i) { return i.representation(); });
        clones   = items.map(function(i) { return i.clone(); });
        
        if (shiftRight) {
            containerStyle.left  = (this.getLeftOffset() - offset) + 'px';
            containerStyle.right = '';
            
            this._splice(clones.reverse(), 'top');
        } else {
            containerStyle.left  = '';
            containerStyle.right = (this.getRightOffset() - offset) + 'px';
            
            this._splice(clones, 'bottom');
        }
        
        containerStyle.width = (this.getWidth() + offset) + 'px';
        
        this._container.setStyle(containerStyle);
        
        this._left     = newLeft;
        this._splicees = splicees;
        
        return this;
    },
    
    _rebalance: function() {
        this._splicees.forEach(function(representation) {
            representation.remove();
        });
        
        this._splicees = [];
        
        this._container.setStyle({
            width: this.getWidth() + 'px',
            left:  this.getLeftOffset() + 'px',
            right: ''
        });
        
        return this;
    },
    
    _splice: function(representations, position) {
        representations.forEach(function(representation) {
            this._container.insert(representation.getHTML(), position);
        }, this);
    },
    
    getOffset: function(sideWidth) {
        var portWidth    = this._viewport.getWidth(),
            currentWidth = this.getCentre().getWidth();
        
        return 0 - (sideWidth - ((portWidth - currentWidth) / 2)).floor().abs();
    },
    
    getLeftOffset: function() {
        return this.getOffset(this.getLeftWidth());
    },
    
    getRightOffset: function() {
        return this.getOffset(this.getRightWidth());
    },
    
    getWidth: function(start, end) {
        return this.klass.getWidth(this._items, start, end);
    },
    
    getLeftWidth: function() {
        return this.getWidth(this._left, this._centre);
    },
    
    getRightWidth: function() {
        return this.getWidth(this._centre + 1, this._left);
    },
    
    getHTML: function() {
        return this._viewport;
    },
    
    next: function(controller) {
        this.centreOn(this._items.add(this._centre, 1), controller);
    },
    
    previous: function(controller) {
        this.centreOn(this._items.subtract(this._centre, 1), controller);
    },
    
    states: {
        /**
         * In this state the gallery is able to accept user input and change
         * which item is centred.
         */
        READY: {
            centreOn: function(centre, controller) {
                var shiftRight, animation;
                
                if (typeof centre !== 'number') {
                    centre = this._items.indexOf(centre);
                    if (centre < 0) return;
                }
                
                if (centre === this._centre) {
                    if (this.getCentre().hasVideo()) {
                        this.notifyObservers('videoselect', this.getCentre().getVideo());
                    }
                    
                    return;
                }
                
                controller = controller || null;
                
                if (this._left > this._centre) {
                    shiftRight = centre < this._centre || centre >= this._left;
                } else {
                    shiftRight = centre < this._centre && centre >= this._left;
                }
                
                this.setState('ANIMATING');
                this.notifyObservers('centreStart', this._items.at(centre), controller);
                
                this._unbalance(centre, shiftRight);
                
                this.getCentre().representation().hide();
                
                this._centre = centre;
                
                animation = {};
                animation[shiftRight ? 'left' : 'right'] = {
                    to: shiftRight ? this.getLeftOffset() : this.getRightOffset()
                };
                
                return this._container.animate(animation, 0.8)
                    ._(this)._rebalance()
                    ._(this).setState('READY')
                    ._(this).notifyObservers('centre', this.getCentre(), controller)
                    ._(this.getCentre()).representation().show()
                    ._(this).notifyObservers('centreEnd', this.getCentre(), controller);
            },
            
            fitToViewport: function() {
                this._container.setStyle({left: this.getLeftOffset() + 'px'});
            },
            
            fireQueue: function() {
                var next = this._queue.shift();
                
                if (next) {
                    this.centreOn.apply(this, next);
                }
            }
        },
        
        /**
         * When the gallery is animating, it should queue centring requests
         * rather than executing them.
         */
        ANIMATING: {
            centreOn: function(centre, controller) {
                this._queue = this._queue || [];
                this._queue.push([centre, controller]);
            }
        }
    },
    
    extend: {
        getWidth: function(list, start, end) {
            if (!(list.isA && list.isA(this.ModNList))) {
                list = new this.ModNList(list);
            }
            
            return list.slice(start || 0, end).reduce(function(width, item) {
                return width + item.getWidth();
            }, 0);
        },
        
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
            
            indexOf: function(element, from) {
                return this._store.indexOf(element, from);
            },
            
            slice: function(start, end) {
                var s1, s2, sliced;
                
                if (!(start || end)) return this._store;
                
                start = this.mod(start);
                end   = typeof end === 'number' && end !== this.n() ? this.mod(end) : this.n();
                
                if (start > end) {
                    s1     = this._store.slice(start);
                    s2     = this._store.slice(0, end);
                    sliced = s1.concat(s2);
                } else {
                    sliced = this._store.slice(start, end);
                }
                
                return sliced;
            },
            
            forEach: function(block, context) {
                return this._store.forEach(block, context);
            },
            
            map: function(block, context) {
                return this._store.map(block, context);
            },
            
            reduce: function(block, context) {
                return this._store.reduce(block, context);
            }
        }),
        
        Item: new JS.Class({
            initialize: function(gallery, options) {
                this._gallery = gallery;
                this._options = options;
                this._state   = options.initialState;
                
                this._width   = options.width  || options.image.width;
                this._height  = options.height || options.image.height;
            },
            
            representation: function() {
                if (this._representation) return this._representation;
                
                this.clone();
                
                return this._representation;
            },
            
            clone: function() {
                this._representation = new this.klass.Representation(this, {
                    name:         this._options.name,
                    description:  this._options.description,
                    uri:          this._options.image.uri,
                    width:        this._options.image.width,
                    height:       this._options.image.height,
                    toggleText:   this._options.toggleText,
                    initialState: this._state
                });
                
                return this._representation;
            },
            
            getHTML: function() {
                return this.representation().getHTML();
            },
            
            hasDescription: function() {
                var desc = this._options.description;
                return typeof desc === 'string' && desc.length > 0;
            },
            
            hasVideo: function() {
                var video = this._options.video, count = 0, p;
                if (typeof video !== 'object') return false;
                for (p in video) if (typeof video[p] === 'object') count++;
                return count > 0;
            },
            
            getVideo: function() {
                return this._options.video || {};
            },
            
            getThumbnail: function() {
                if (this._thumbnail) return this._thumbnail;
                
                var self = this;
                self._thumbnail = Ojay(Ojay.HTML.div({className: 'thumbnail'}, function(H) {
                    if (self.hasVideo()) {
                        H.div({className: 'video-button'}, 'Select video');
                    }
                    
                    H.img({
                        alt: self._options.name,
                        src: self._options.thumbnail.uri
                    });
                    
                    H.span({className: 'thumbnail-label'}, self._options.name);
                }))
                .setStyle({
                    width:  self._options.thumbnail.width  + 'px',
                    height: self._options.thumbnail.height + 'px'
                });
                
                return this._thumbnail;
            },
            
            getWidth: function() {
                return this._width;
            },
            
            getHeight: function() {
                return this._height;
            },
            
            getGallery: function() {
                return this._gallery;
            },
            
            setState: function(state) {
                this._state = state;
            },
            
            extend: {
                Representation: new JS.Class({
                    include: [Ojay.Observable, JS.State],
                    
                    extend: {
                        TOGGLE_TEXT: {
                            EXPANDED:  'Collapse',
                            COLLAPSED: 'Expand'
                        },
                        
                        TOGGLE_SPEED:   0.3,
                        FADE_SPEED:     0.4
                    },
                    
                    initialize: function(item, options) {
                        this._item    = item;
                        this._options = options;
                        
                        this._initialState = options.initialState || 'EXPANDED';
                        
                        options.toggleText = options.toggleText || {};
                        this._toggleText = {
                            EXPANDED:  options.toggleText.expanded  || this.klass.TOGGLE_TEXT.EXPANDED,
                            COLLAPSED: options.toggleText.collapsed || this.klass.TOGGLE_TEXT.COLLAPSED
                        };
                        
                        this._toggleSpeed = options.toggleSpeed || this.klass.TOGGLE_SPEED;
                        this._fadeSpeed   = options.fadeSpeed   || this.klass.FADE_SPEED;
                        
                        this._makeHTML();
                    },
                    
                    setState: function(state) {
                        this._item.setState(state);
                        this.callSuper(state);
                        return this;
                    },
                    
                    getHTML: function() {
                        return this._html;
                    },
                    
                    remove: function() {
                        this._html.remove();
                    },
                    
                    show: function(options) {
                        options = options || {};
                        
                        this.getHTML().addClass('current');
                        
                        if (options.animate !== false) {
                            this._contentWrapper.show().animate({
                                opacity: {
                                    from: 0,
                                    to:   1
                                }
                            }, this._fadeSpeed);
                        } else {
                            this._contentWrapper.setStyle({opacity: 1}).show();
                        }
                    },
                    
                    hide: function(options) {
                        options = options || {};
                        
                        this.getHTML().removeClass('current');
                        
                        if (options.animate !== false) {
                            this._contentWrapper.animate({
                                opacity: {
                                    from: 1,
                                    to:   0
                                }
                            }, this._fadeSpeed).hide();
                        } else {
                            this._contentWrapper.setStyle({opacity: 0}).hide();
                        }
                    },
                    
                    states: {
                        EXPANDED: {
                            toggle: function() {
                                this._toggle('COLLAPSED');
                            }
                        },
                        
                        COLLAPSED: {
                            toggle: function() {
                                this._toggle('EXPANDED');
                            }
                        },
                        
                        ANIMATING: {}
                    },
                    
                    _toggle: function(newState) {
                        if (!this._item.hasDescription()) return;
                        
                        var oldState = newState === 'EXPANDED' ? 'COLLAPSED' : 'EXPANDED';
                        
                        this.setState('ANIMATING');
                        
                        this._descWrapper.animate({
                            height: {
                                from: this._heights[oldState],
                                to:   this._heights[newState]
                            }
                        }, this._toggleSpeed)
                        ._(this._descToggle).setContent(this._toggleText[newState])
                        ._(function() {
                            this.setState(newState);
                        }.bind(this));
                    },
                    
                    _makeHTML: function() {
                        var self = this;
                        
                        self._html = Ojay(Ojay.HTML.div({className: 'item'}, function(H) {
                            self._contentWrapper = Ojay(H.div({className: 'content'}, function(C) {
                                if (self._item.hasVideo()) {
                                    self._videoButton = Ojay(C.div({className: 'video-button'}, 'Play video'));
                                }
                                
                                if (self._item.hasDescription()) {
                                    self._descWrapper = Ojay(C.div({className: 'description-wrapper'}, function(W) {
                                        self._descToggle  = Ojay(W.div({className: 'description-toggle'}))
                                            .setContent(self._toggleText[self._initialState]);
                                        self._description = Ojay(W.div({className: 'description'}))
                                            .setContent(self._options.description);
                                    }));
                                }
                            }));
                        }));
                        
                        this._image = Ojay(Ojay.HTML.img({alt: this._options.name}));
                        
                        this._addEvents();
                        this._insertImage();
                        
                        this._html.setStyle({
                            width:    this._options.width  + 'px',
                            height:   this._options.height + 'px',
                            overflow: 'hidden',
                            position: 'relative'
                        }).addClass(self._item.hasVideo() ? 'item-video' : 'item-image');
                        
                        this._contentWrapper.setStyle({
                            width:    this._options.width  + 'px',
                            height:   this._options.height + 'px',
                            position: 'absolute',
                            top:      0,
                            left:     0
                        });
                    },
                    
                    _insertImage: function() {
                        this._image.on('load')._(this._html).insert(this._image, 'top');
                        this._image.set({src: this._options.uri});
                    },
                    
                    _addEvents: function() {
                        this._html.on('click')._(this._item.getGallery()).centreOn(this._item);
                        
                        if (this._item.hasDescription()) {
                            this._descToggle.on('click')._(this).toggle();
                            this._descWrapper.on('click', Ojay.stopPropagate);
                        }
                        
                        setTimeout(function() {
                            this._setup();
                        }.bind(this), 10);
                    },
                    
                    _setup: function() {
                        if (this._item.hasDescription()) {
                            this._heights = {};
                            this._heights.EXPANDED = this._descWrapper.getHeight();
                            this._description.hide();
                            this._heights.COLLAPSED = this._descWrapper.getHeight();
                            this._descWrapper.setStyle({
                                position: 'absolute',
                                left:     0,
                                bottom:   0,
                                width:    this._options.width + 'px',
                                height:   this._heights[this._initialState] + 'px',
                                overflow: 'hidden'
                            });
                            this._description.show();
                        }
                        
                        this.hide({animate: false});
                        this.setState(this._initialState);
                        this.notifyObservers('ready');
                    }
                })
            }
        })
    }
});

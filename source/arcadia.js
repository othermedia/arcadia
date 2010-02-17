Arcadia = new JS.Class('Arcadia', {
    initialize: function(container, json) {
        var x = 0, y = 0;
        
        this._container = Ojay(container);
        this._viewport  = Ojay(Ojay.HTML.div({className: 'viewport'}));
        
        this._container.children().remove()
        ._(this._container).insert(this._viewport, 'after')
        ._(this._viewport).setContent(this._container);
        
        this._items = json.images.map(function(img, i) {
            var item = new this.klass.Item(this, img);
            
            this._container.insert(item.getHTML(), 'bottom');
            
            item.getHTML().on('click', function() {
                this.setPage(i);
            }, this);
            
            x += img.width;
            
            if (img.height > y) {
                y = img.height;
            }
            
            return item;
        }, this);
        
        this._current = Math.floor(this._items.length / 2);
        this._left    = 0;
        
        this._container.setStyle({
            width:    x + 'px',
            height:   y + 'px',
            position: 'absolute',
            top:      0,
            left:     this.getOffset() + 'px'
        });
    },
    
    balance: function(index) {
        var offset = 0, left;
        
        // Have to add the number of items before applying the mod operator
        // because the result of applying JavaScript's mod operation has the
        // same sign as the dividend, e.g. -1 % 10 == -1.
        left = (this._left + index - this._current + this._items.length) % this._items.length;
        
        this._items.forEach(function(item, i) {
            if (i >= this._left && i < left) {
                this._container.insert(item.getHTML(), 'top');
                offset += item.getWidth();
            }
        }, this);
        
        this._container.setStyle({
            left: (this.getOffset() - offset) + 'px'
        });
    },
    
    getOffset: function() {
        var portWidth, itemsWidth, currentWidth, offset;
        
        portWidth    = this._viewport.getWidth();
        itemsWidth   = this.getWidth();
        currentWidth = this._items[this._current].getWidth();
        offset       = Math.floor((portWidth + currentWidth - itemsWidth) / 2);
        
        return offset;
    },
    
    getWidth: function() {
        return this._items.reduce(function(width, item) {
            return width + item.getWidth();
        }, 0);
    },
    
    setPage: function(index) {
        if (this._current === index) return;
        
        this.balance(index);
        
        this._container.animate({
            left: {
                to: this.getOffset()
            }
        });
    },
    
    extend: {
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
                
                this._thumbnail = Ojay(Ojay.HTML.div({className: 'thumbnail'}, function(H) {
                    H.img({
                        alt: this._name,
                        src: this._spec.thumbnail.uri
                    });
                }))
                .setStyle({
                    width:  this._spec.thumbnail.width  + 'px',
                    height: this._spec.thumbnail.height + 'px'
                });
            }
        })
    }
});

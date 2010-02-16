Arcadia = new JS.Class('Arcadia', {
    initialize: function(container, json) {
        var x = 0, y = 0;
        
        this._container = Ojay(container);
        this._viewport  = Ojay(Ojay.HTML.div({className: 'viewport'}));
        
        this._container.children().remove()
        ._(this._container).insert(this._viewport, 'after')
        ._(this._viewport).setContent(this._container);
        
        this._items = json.images.map(function(img) {
            var item = new this.klass.Item(img);
            
            this._container.insert(item.getHTML(), 'bottom');
            
            x += img.width;
            
            if (img.height > y) {
                y = img.height;
            }
            
            return item;
        }, this);
        
        this._container.setStyle({
            width:  x + 'px',
            height: y + 'px'
        });
    },
    
    setPage: function(index) {
        if (this._current === index) return;
        
        this._items[this._current].hideDescription()
        ._(this._container);
    },
    
    extend: {
        Item: new JS.Class({
            initialize: function(spec) {
                this._uri    = spec.uri;
                this._name   = spec.name;
                this._desc   = spec.description;
                this._width  = spec.width;
                this._height = spec.height;
            },
            
            getHTML: function() {
                if (this._html) return this._html;
                
                var self = this;
                self._html = Ojay(Ojay.HTML.div({className: 'item'}, function(H) {
                    self._image = Ojay(H.img({
                        alt: self._name,
                        src: self._uri
                    }));
                    
                    self._descWrapper = Ojay(H.div({className: 'description-wrapper'}, function(W) {
                        self._descToggle  = Ojay(W.div({className: 'description-toggle'}, 'More'));
                        self._description = Ojay(W.div({className: 'description'}, self._desc));
                    }));
                }));
                
                this._html.setStyle({
                    width:    this._width  + 'px',
                    height:   this._height + 'px',
                    overflow: 'hidden',
                    position: 'relative'
                });
                
                this._descWrapper.setStyle({
                    position: 'absolute',
                    left:   0,
                    bottom: 0,
                    width:  this._width + 'px'
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
                        alt: this._json.name,
                        src: this._json.thumbnail.uri
                    });
                }));
                
                this._thumbnail.setStyle({
                    width:  this._json.thumbnail.width  + 'px',
                    height: this._json.thumbnail.height + 'px'
                });
            }
        })
    }
});

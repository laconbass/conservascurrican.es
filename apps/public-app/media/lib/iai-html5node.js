/**
 * iai HtmlNode plugin
 */

(function($, w){
  function log() {
    if(iai && iai.env == 'development')
      { console.log.apply(console, arguments); }
  }
  var Tag, Htm5lNode = Tag = function Html5Node(name, data){
    this.name = name;
    // data may be a child or attribute descriptor, depending on node's name
    data = Tag.buildNodedata(data, name);
    
    // attributes
    this['@'] = data['@'] || {};
    // id attribute shortcut
    if(data['#']) { this['@']['id'] = data['#']; };

    // data to do variable replacement and list-block descriptors
    this.data = data.data || {};
    this.blocks = data.blocks || {};

    // childs are stored as array
    this.$ = $.isArray(data.$)? data.$ : [];

    // parse the content descriptor
    if(typeof data.$ == 'string') {
      // content is a text node
      this.push(data.$);
    }
    else if($.isPlainObject(data.$)){
      // convert each property of the content's object to an Html5Node
      $.each(data.$, $.proxy(function(index, value){
        /*
          SIMPLE MODE: index="nodename", value=nodedata
        */
        if( !this.tagExists(index) ){
          // simple mode nodes inherit data from parent
          this.push(index, value, this.data);
          return;
        }
        /*
          LIST MODE: index="@variable", value="nodename"
        */
        var list = this.tagValue(index)
          , block = this.blocks[index];
        ;
        log('building', value, 'list for', index, 'with block defined?', !!block);
        // @variable must match exactly a variable name and be defined
        if(!list) {
          throw (this+" variable '"+index+"' must be defined to be usable as list-block");
        }
        // @variable data must be iterable ([] or {})
        if(!$.isArray(list) && !$.isPlainObject(list)) {
          throw (this+" variable '"+index+"' must be iterable ([] or {})");
        }
        // each list item pushes a new node
        // nodedata['$'] can be defined as a "block".
        // The variable content will be used as nodedata if block is not defined
        for(var key in list) {
          var nodedata = Tag.buildNodedata(block || list[key]);
          // push the new node
          // if the block has been defined, variable content is used as tagdata
          // this.data is used elsecase
          // an 'item_key' variable is added, it is the item's key on the list
          this.push(value, nodedata, $.extend(!!block? list[key] : this.data, {
            'item_key': (function(n){ return n; })(key)
          }));
          // add 'id' attribute if we are iterating through an object
          if(!$.isNumeric(key)) { this.$[this.$.length-1].attr('id', key); }
        }
        log('after list build $ is', this.$);
      }, this));
    }
  }
  /*
    CONSTANTS, acording to HTML5 spec
    @updated 7/1/2013 http://www.w3.org/TR/html5/syntax.html#void-elements
    @const VOID_ELEMENTS(array): Html5 void elements names
    @const RAW_ELEMENTS(array): Html5 raw elements names
    @const RCDATA_ELEMENTS(array): Html5 RCDATA elements names
    @const FOREIGN_ELEMENTS(array): Html5 foreign elements names
    @const ELEMENT_TYPES(array): Html5 element types
  */
  Tag.ELEMENT_TYPES = ['Void', 'Raw', 'RCDATA', 'Foreign'];
  Tag.VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  Tag.RAW_ELEMENTS = ['script', 'style'];
  Tag.RCDATA_ELEMENTS = ['textarea', 'title'];
  Tag.FOREIGN_ELEMENTS = [];
  // loop to create is*elementType functions through a function decorator
  var decorator = function(){};
  function decorate(obj, decorator){
    for(var i in Tag.ELEMENT_TYPES){
      var type = Tag.ELEMENT_TYPES[i];
      obj['is'+type] = decorator(type);
    }
  }
  /*
    @static is(elementname, type): Determine whether the argument has type
    @static isVoid(elementname): Determine whether the argument is a Void element name
    @static isRaw(elementname): Determine whether the argument is a Raw element name
    @static isRCDATA(elementname): Determine whether the argument is a RCDATA element name
    @static isForeign(elementname): Determine whether the argument is a Foreign element name
  */
  Tag.is = function(elementname, type){
    return $.inArray(elementname, Tag[type.toUpperCase()+'_ELEMENTS']) > -1;
  }
  decorate(Tag, function(type){  return function(elementname){ return Tag.is(elementname, type); };  });
  /*
    @static isContainer(elementname): Determine whether the argument is the element name of a node type that can have childs
  */
  Tag.isContainer = function(elementname){
    return !Tag.isVoid(elementname) && !Tag.isRaw(elementname) && !Tag.isRCDATA(elementname);
  };
  /*
    @static isNodedata(object): determine whether the argument is an object and has a value defined for any of theese keys: '#', '@', '#'
  */
  Tag.isNodedata = function(o){ return $.isPlainObject(o) && (!!o['@'] || !!o['#'] || !!o['$']); }
  /*
    @static buildNodedata(): Transform o to a Nodedata object usable with elementname as node name
  */
  Tag.buildNodedata = function(o, elementname){
    if(Tag.isNodedata(o)) return o;
    // if o is an object, and element can't have content, use o as Attribute descriptor
    if($.isPlainObject(o) && !Tag.isContainer(elementname)) return { '@': o };
    // elsecase use o as the child descriptor
    return { $: o };
  };
  /*
    @method isVoid(): Tell whatever this tag is a void element
    @method isRaw(): Tell whatever this tag is a raw element
    @method isRCDATA(): Tell whatever this tag is a RCDATA element
    @method isForeign(): Tell whatever this tag is a foreign element
  */
  decorate(Tag.prototype, function(type){  return function(){ return Tag.is(this.name, type); };  });
  /*
    @method isEmptyForeign: tells whatever this Node is a Foreign element without child nodes
    @method isContainer: tells whatever this Node can have childs
    @method is$(nodedata): tells whatever nodedata should be treated as nodedata['$'] for this object
    @method is@(nodedata): tells whatever nodedata should be treated as nodedata['@'] for this object
  */
  Tag.prototype.isEmptyForeign = function(){ return this.isForeign() && !this.$.length; };
  Tag.prototype.isContainer = function(){ return Tag.isContainer(this.name); };
  /*
    // NODE MANIPULATION METHODS
    @method attr(name, value): add an attribute 
    @method attr(name): get the value of an attribute 
    @method push(Tag): push an Html5Node as a child of this one
    @method push(string): push a new text node as a child of this one
    @method push(nodename, nodedata): push a new node as a child of this one
  */
  Tag.prototype.attr = function(name, value){
      if( $.isPlainObject(name) ) {
        $.each( name, $.proxy( function(i, e){
          this.attr(i, e);
        }, this ) );
        return this;
      }
      if( name === 'style' && $.isPlainObject( value ) ) {
        this['@'].style = '';
        for( var prop in value ) {
          this['@'].style += ( prop+': '+value[prop]+'; ' );
        }
        return this;
      }
      if( arguments.length == 1 ) {
        return this['@'][name.toString()];
      }
      this['@'][name.toString()] = value.toString();
      return this;
  }
  Tag.prototype.push = function(nodename, nodedata, tagdata){
      if(arguments.length == 1){
        // if is a tag, push it
        if( arguments[0] instanceof Tag ){
          this.$.push( arguments[0] );
        } else {
          this.$.push(arguments[0].toString());
        }
        return this;
      }
      log('push', nodename, 'into', this.toString() );//*/, 'with data', tagdata);
      // maybe the nodedata is an attribute or child descriptor, depending on nodename
      nodedata = Tag.buildNodedata(nodedata, nodename);
      // blocks are inherited from this, extended by new node's data
      nodedata.blocks = $.extend(this.blocks, nodedata.blocks || {});
      // new node's data is extended by optional tagdata argument
      nodedata.data = $.extend(nodedata.data || {}, tagdata || {}, {
        // TODO set a reference to parent's data?
        //parent: this.data
      });
      // push the new node to child's array
      this.$.push( new Tag(nodename, nodedata) );
      // TODO set a reference to parent???
      // this.$[this.$.length-1].parent = this;
  };
  /*
    VARIABLE TAG FIDING AND REPLACING METHODS
    @const VAR_TAG
    @method tagExists(string): tells whetever string has variables for replacement ("@varname")
    @method tagName(string): ...
    @method tagValue(string): ...
    @method tagList(string): ...
    @method tagReplace(string): replaces all variables with the correspondant values
  */
  Tag.VAR_TAG = /@[A-z]\w*/g;
  Tag.prototype.tagExists = function(string){
    //log('does', string, 'have tags?', !!string.match(Tag.VAR_TAG));
    return !!string.match(Tag.VAR_TAG);
  };
  Tag.prototype.tagName = function(string){
    return string.replace('@', '');
  };
  Tag.prototype.tagValue = function(tagname){
    var val = this.data
      , parts = this.tagName(tagname).split('.')
    ;
    while(parts.length){
      val = val[parts.shift()];
    }
    return val;
  };
  Tag.prototype.tagList = function(string){
    var arr = string.match(Tag.VAR_TAG);
    return $.grep(arr, function(ele, ind){ return $.inArray(ele, arr) === ind; });
  };
  Tag.prototype.tagReplace = function(string){
    if( !this.tagExists(string) ) { return string; }
    log('replace', this.tagList(string), 'for', this+'');//*/, 'with', this.data);
    $.each(this.tagList(string), $.proxy(function(i, tag){
      var value = this.tagValue(tag);
      // replace only if a value is defined
      if(typeof value != 'undefined'){
        string = string.replace(new RegExp(tag+'(?!\\w)', 'g'), value);
      }
      else{
        log('Notice:', this+'', 'does not have value for', tag);
      }
    }, this));
    return string;
  };
  /*
    TO STRING METHODS
    @method toString(): customize the toString behaviour
    @method dump(): dump the node to it's html representation
  */
  Tag.prototype.toString = function(){ return "[Html5Node "+this.name+"]"; }
  Tag.prototype.dump = function(){
      // open tag opener
      var str = '<' + this.name;
      // add attributes
      for(var name in this['@']) {
        str += (' '+name+'="'+this['@'][name]+'"');
      }
      // empty foreign? add slash if so and close tag opener
      if(this.isEmptyForeign()){ str += '/'; } str += '>';

      // add closer if not void neither empty foreign
      if(!this.isVoid() && !this.isEmptyForeign()) {
          // add childs if exist
          if(this.$.length) {
              str += $.map(this.$, function(e){
                // non-string childs are supossed to be Html5Nodes too
                return typeof e == 'string'? e : e.dump();
              }).join('');
          }
          str += ('</'+this.name+'>');
      }
      // replace tag values before returning
      return this.tagReplace(str);
  };
  // extend the window.iai object
  w.iai = $.extend(w.iai || {}, {
    Html5Node: Tag
  });
})(jQuery, window);

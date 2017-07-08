/**
 * jQuery Grid-A-Licious(tm) v3.01
 *
 * Terms of Use - jQuery Grid-A-Licious(tm)
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Copyright 2008-2012 Andreas Pihlström (Suprb). All rights reserved.
 * (http://suprb.com/apps/gridalicious/)
 *
 */

// Debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
// Copy pasted from http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/

(function ($, sr) {
    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced() {
            var obj = this,
                args = arguments;

            function delayed() {
                if (!execAsap) func.apply(obj, args);
                timeout = null;
            };
            if (timeout) clearTimeout(timeout);
            else if (execAsap) func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 150);
        };
    };
    jQuery.fn[sr] = function (fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };
})(jQuery, 'smartresize');

// The Grid-A-Licious magic

(function ($) {

    $.Gal = function (options, element) {
        this.element = jQuery(element);
        this._init(options);
    };

    $.Gal.settings = {
        selector: '.item',
        width: 225,
        gutter: 20,
        animate: false,
        animationOptions: {
            speed: 200,
            duration: 300,
            effect: 'fadeInOnAppear',
            queue: true,
            complete: function () {}
        },
    };

    $.Gal.prototype = {

        _init: function (options) {
            var container = this;
            this.name = this._setName(5);
            this.gridArr = [];
            this.gridArrAppend = [];
            this.gridArrPrepend = [];
            this.setArr = false;
            this.setGrid = false;
            this.setOptions;
            this.cols = 0;
            this.itemCount = 0;
            this.prependCount = 0;
            this.isPrepending = false;
            this.appendCount = 0;
            this.resetCount = true;
            this.ifCallback = true;
            this.box = this.element;
            this.boxWidth = this.box.width();
            this.options = $.extend(true, {}, $.Gal.settings, options);
            this.gridArr = $.makeArray(this.box.find(this.options.selector));
            this.isResizing = false;
            this.w = 0;
            this.boxArr = [];

            // build columns
            this._setCols();
            // build grid
            this._renderGrid('append');
            // add class 'gridalicious' to container
            jQuery(this.box).addClass('gridalicious');
            // add smartresize
            jQuery(window).smartresize(function () {
                container.resize();
            });
        },

        _setName: function (length, current) {
            current = current ? current : '';
            return length ? this._setName(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
        },

        _setCols: function () {
            // calculate columns
            this.cols = Math.floor(this.box.width() / this.options.width);
            //If Cols lower than 1, the grid disappears
            if (this.cols < 1) { this.cols = 1; }
            diff = (this.box.width() - (this.cols * this.options.width) - this.options.gutter) / this.cols;
            w = (this.options.width + diff) / this.box.width() * 100;
            this.w = w;
            // add columns to box
            for (var i = 0; i < this.cols; i++) {
                var div = jQuery('<div></div>').addClass('galcolumn').attr('id', 'item' + i + this.name).css({
                    'width': w + '%',
                    'paddingLeft': this.options.gutter,
                    'paddingBottom': this.options.gutter,
                    'float': 'left',
                    '-webkit-box-sizing': 'border-box',
                    '-moz-box-sizing': 'border-box',
                    '-o-box-sizing': 'border-box',
                    'box-sizing': 'border-box'
                });
                this.box.append(div);
            }
            
            
            this.box.find(jQuery('#clear' + this.name)).remove();
            // add clear float
            var clear = jQuery('<div></div>').css({
                'clear': 'both',
                'height': '0',
                'width': '0',
                'display': 'block'
            }).attr('id', 'clear' + this.name);
            this.box.append(clear);
        },

        _renderGrid: function (method, arr, count, prepArray) {
            var items = [];
            var boxes = [];
            var prependArray = [];
            var itemCount = 0;
            var prependCount = this.prependCount;
            var appendCount = this.appendCount;
            var gutter = this.options.gutter;
            var cols = this.cols;
            var name = this.name;
            var i = 0;
            var w = jQuery('.galcolumn').width();

            // if arr
            if (arr) {
                boxes = arr;
                // if append
                if (method == "append") {
                    // get total of items to append
                    appendCount += count;
                    // set itemCount to last count of appened items
                    itemCount = this.appendCount;
                }               
                // if prepend
                if (method == "prepend") {
                    // set itemCount
                    this.isPrepending = true;
                    itemCount = Math.round(count % cols);
                    if (itemCount <= 0) itemCount = cols; 
                }
                // called by _updateAfterPrepend()
                if (method == "renderAfterPrepend") {
                    // get total of items that was previously prepended
                    appendCount += count;
                    // set itemCount by counting previous prepended items
                    itemCount = count;
                }
            }
            else {
                boxes = this.gridArr;
                appendCount = jQuery(this.gridArr).size();
            }

            // push out the items to the columns
            $.each(boxes, function (index, value) {
                var item = jQuery(value);
                var width = '100%';
            
                // if you want something not to be "responsive", add the class "not-responsive" to the selector container            
                if (item.hasClass('not-responsive')) {
                  width = 'auto';
                }
                
                item.css({
                    'marginBottom': gutter,
                    'zoom': '1',
                    'filter': 'alpha(opacity=0)',
                    'opacity': '0'
                });
                //.find('img, object, embed, iframe').css({
                //    'width': width,
                //    'height': 'auto',
                //    'display': 'block',
                //    'margin-left': 'auto',
                //    'margin-right': 'auto'
                //});
                
                // prepend on append to column
                if (method == 'prepend') {
                    itemCount--;
                    jQuery("#item" + itemCount + name).prepend(item);
                    items.push(item);
                    if(itemCount == 0) itemCount = cols;
                    
                } else {
                    jQuery("#item" + itemCount + name).append(item);
                    items.push(item);
                    itemCount++;
                    if (itemCount >= cols) itemCount = 0;
                    if (appendCount >= cols) appendCount = (appendCount - cols);
                }
            });

            this.appendCount = appendCount;
            this.itemCount = itemCount;

            if (method == "append" || method == "prepend") {
                if (method == "prepend") { 
                  // render old items and reverse the new items
                  this._updateAfterPrepend(this.gridArr, boxes);
                }
                this._renderItem(items);
                this.isPrepending = false;
            } else {
                this._renderItem(this.gridArr);
            }
        },

        _collectItems: function () {
            var collection = [];
            jQuery(this.box).find(this.options.selector).each(function (i) {
                collection.push(jQuery(this));
            });
            return collection;
        },

        _renderItem: function (items) {

            var speed = this.options.animationOptions.speed;
            var effect = this.options.animationOptions.effect;
            var duration = this.options.animationOptions.duration;
            var queue = this.options.animationOptions.queue;
            var animate = this.options.animate;
            var complete = this.options.animationOptions.complete;

            var i = 0;
            var t = 0;

            // animate
            if (animate === true && !this.isResizing) {

                // fadeInOnAppear
                if (queue === true && effect == "fadeInOnAppear") {
                    if (this.isPrepending) items.reverse();
                    $.each(items, function (index, value) {
                        setTimeout(function () {
                            jQuery(value).animate({
                                opacity: '1.0'
                            }, duration);
                            t++;
                            if (t == items.length) {
                                complete.call(undefined, items)
                            }
                        }, i * speed);
                        i++;
                    });
                } else if (queue === false && effect == "fadeInOnAppear") {
                    if (this.isPrepending) items.reverse();
                    $.each(items, function (index, value) {
                        jQuery(value).animate({
                            opacity: '1.0'
                        }, duration);
                        t++;
                        if (t == items.length) {
                            if (this.ifCallback) {
                                complete.call(undefined, items);
                            }
                        }
                    });
                }

                // no effect but queued
                if (queue === true && !effect) {
                    $.each(items, function (index, value) {
                        jQuery(value).css({
                            'opacity': '1',
                            'filter': 'alpha(opacity=100)'
                        });
                        t++;
                        if (t == items.length) {
                            if (this.ifCallback) {
                                complete.call(undefined, items);
                            }
                        }
                    });
                }

            // don not animate & no queue
            } else {
                $.each(items, function (index, value) {
                    jQuery(value).css({
                        'opacity': '1',
                        'filter': 'alpha(opacity=100)'
                    });
                });
                if (this.ifCallback) {
                    complete.call(items);
                }
            }
        },

        _updateAfterPrepend: function (prevItems, newItems) {            
            var gridArr = this.gridArr;
            // add new items to gridArr
            $.each(newItems, function (index, value) {
                gridArr.unshift(value);
            });
            this.gridArr = gridArr;
        },

        resize: function () {
            if (this.box.width() === this.boxWidth) {
                return;
            }

            // delete columns in box
            this.box.find(jQuery('.galcolumn')).remove();
            // build columns
            this._setCols();
            // build grid
            this.ifCallback = false;
            this.isResizing = true;
            this._renderGrid('append');
            this.ifCallback = true;
            this.isResizing = false;
            this.boxWidth = this.box.width();
        },

        append: function (items) {
            var gridArr = this.gridArr;
            var gridArrAppend = this.gridArrPrepend;
            $.each(items, function (index, value) {
                gridArr.push(value);
                gridArrAppend.push(value);
            });
            this._renderGrid('append', items, jQuery(items).size());
        },

        prepend: function (items) {
            this.ifCallback = false;
            this._renderGrid('prepend', items, jQuery(items).size());
            this.ifCallback = true;
        },
    };

    $.fn.gridalicious = function (options, e) {
        if (typeof options === 'string') {
            this.each(function () {
                var container = $.data(this, 'gridalicious');
                container[options].apply(container, [e]);
            });
        } else {
            this.each(function () {
                $.data(this, 'gridalicious', new $.Gal(options, this));
            });
        }
        return this;
    }

})(jQuery);

;(function(root, factory) {
if (typeof define === 'function' && define.amd) {
    // Cheeky wrapper to add root to the factory call
    var factoryWrap = function () { 
        var argsCopy = [].slice.call(arguments); 
        argsCopy.unshift(root);
        return factory.apply(this, argsCopy); 
    };
    define(['jquery'], factoryWrap);
} else if (typeof exports === 'object') {
    module.exports = factory(root, require('jquery'));
} else {
    root.Curator = factory(root, root.jQuery);
}
}(this, function(root, jQuery) {


var Factory = function () {};
var slice = Array.prototype.slice;

var augment = function (base, body) {
    var uber = Factory.prototype = typeof base === "function" ? base.prototype : base;
    var prototype = new Factory(), properties = body.apply(prototype, slice.call(arguments, 2).concat(uber));
    if (typeof properties === "object") for (var key in properties) prototype[key] = properties[key];
    if (!prototype.hasOwnProperty("constructor")) return prototype;
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
};

augment.defclass = function (prototype) {
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
};

augment.extend = function (base, body) {
    return augment(base, function (uber) {
        this.uber = uber;
        return body;
    });
};


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
    var _tmplCache = {};

    var helpers = {
        networkIcon:function () {
            return this.data.network_name.toLowerCase();
        },
        userUrl:function () {
            var netId = this.data.network_id+'';
            if (netId === '1') {
                return 'http://twitter.com/' + this.data.user_screen_name;
            } else if (netId === '2') {
                return 'http://instagram.com/'+this.data.user_screen_name;
            } else if (netId === '3') {
                return 'http://facebook.com/'+this.data.user_screen_name;
            }

            return this.data.network_id;

        },
        parseText:function(s) {
            if (this.data.network_id===1 || this.data.network_id==='1') {
                // twitter
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.twitterLinks(s);
            } else if (this.data.network_id===2 || this.data.network_id==='2') {
                // instagram
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.instagramLinks(s);
            }

            return s;
        },
        contentImageClasses : function () {
            return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden';
        },
        contentTextClasses : function () {
            return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden';

        },
        fuzzyDate : function (dateString)
        {
            var date = Date.parse(dateString+' UTC');
            var delta = Math.round((new Date () - date) / 1000);

            var minute = 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7;

            var fuzzy;

            if (delta < 30) {
                fuzzy = 'Just then';
            } else if (delta < minute) {
                fuzzy = delta + ' seconds ago';
            } else if (delta < 2 * minute) {
                fuzzy = 'a minute ago.'
            } else if (delta < hour) {
                fuzzy = Math.floor(delta / minute) + ' minutes ago';
            } else if (Math.floor(delta / hour) == 1) {
                fuzzy = '1 hour ago.'
            } else if (delta < day) {
                fuzzy = Math.floor(delta / hour) + ' hours ago';
            } else if (delta < day * 2) {
                fuzzy = 'Yesterday';
            } else {
                fuzzy = date;
            }

            return fuzzy;
        },
        prettyDate : function(time) {
            var date = Curator.DateUtils.dateFromString(time);

            var diff = (((new Date()).getTime() - date.getTime()) / 1000);
            var day_diff = Math.floor(diff / 86400);
            var year = date.getFullYear(),
                month = date.getMonth()+1,
                day = date.getDate();

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
                return (
                    year.toString()+'-'
                    +((month<10) ? '0'+month.toString() : month.toString())+'-'
                    +((day<10) ? '0'+day.toString() : day.toString())
                );

            var r =
                (
                    (
                        day_diff == 0 &&
                        (
                            (diff < 60 && "just now")
                            || (diff < 120 && "1 minute ago")
                            || (diff < 3600 && Math.floor(diff / 60) + " minutes ago")
                            || (diff < 7200 && "1 hour ago")
                            || (diff < 86400 && Math.floor(diff / 3600) + " hours ago")
                        )
                    )
                    || (day_diff == 1 && "Yesterday")
                    || (day_diff < 7 && day_diff + " days ago")
                    || (day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago")
                );
            return r;
        }
    };

    this.parseTemplate = function(str, data) {
        /// <summary>
        /// Client side template parser that uses &lt;#= #&gt; and &lt;# code #&gt; expressions.
        /// and # # code blocks for template expansion.
        /// NOTE: chokes on single quotes in the document in some situations
        ///       use &amp;rsquo; for literals in text and avoid any single quote
        ///       attribute delimiters.
        /// </summary>
        /// <param name="str" type="string">The text of the template to expand</param>
        /// <param name="data" type="var">
        /// Any data that is to be merged. Pass an object and
        /// that object's properties are visible as variables.
        /// </param>
        /// <returns type="string" />
        var err = "";
        try {
            var func = _tmplCache[str];
            if (!func) {
                var strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");
                var strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                        "with(obj){p.push('" + strComp + "');}return p.join('');";
                func = new Function("obj", strFunc);  // jshint ignore:line
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            root.console.log ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();
// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// IE8+
// https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/master/jQuery.XDomainRequest.js


if (!jQuery.support.cors && jQuery.ajaxTransport && root.XDomainRequest) {
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^'+root.location.protocol, 'i');
    var htmlRegEx = /text\/html/i;
    var jsonRegEx = /\/json/i;
    var xmlRegEx = /\/xml/i;

    // ajaxTransport exists in jQuery 1.5+
    jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
        jqXHR = jqXHR;
        // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
        if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
            var xdr = null;
            var userType = (userOptions.dataType||'').toLowerCase();
            return {
                send: function(headers, complete){
                    xdr = new root.XDomainRequest();
                    if (/^\d+$/.test(userOptions.timeout)) {
                        xdr.timeout = userOptions.timeout;
                    }
                    xdr.ontimeout = function(){
                        complete(500, 'timeout');
                    };
                    xdr.onload = function(){
                        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                        var status = {
                            code: 200,
                            message: 'success'
                        };
                        var responses = {
                            text: xdr.responseText
                        };
                        try {
                            if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                                responses.html = xdr.responseText;
                            } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
                                try {
                                    responses.json = jQuery.parseJSON(xdr.responseText);
                                } catch(e) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    //throw 'Invalid JSON: ' + xdr.responseText;
                                }
                            } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
                                var doc = new root.ActiveXObject('Microsoft.XMLDOM');
                                doc.async = false;
                                try {
                                    doc.loadXML(xdr.responseText);
                                } catch(e) {
                                    doc = undefined;
                                }
                                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    throw 'Invalid XML: ' + xdr.responseText;
                                }
                                responses.xml = doc;
                            }
                        } catch(parseMessage) {
                            throw parseMessage;
                        } finally {
                            complete(status.code, status.message, responses, allResponseHeaders);
                        }
                    };
                    // set an empty handler for 'onprogress' so requests don't get aborted
                    xdr.onprogress = function(){};
                    xdr.onerror = function(){
                        complete(500, 'error', {
                            text: xdr.responseText
                        });
                    };
                    var postData = '';
                    if (userOptions.data) {
                        postData = (jQuery.type(userOptions.data) === 'string') ? userOptions.data : jQuery.param(userOptions.data);
                    }
                    xdr.open(options.type, options.url);
                    xdr.send(postData);
                },
                abort: function(){
                    if (xdr) {
                        xdr.abort();
                    }
                }
            };
        }
    });
}
// Test jQuery exists

var Curator = {
    debug:false,
    SOURCE_TYPES : ['twitter','instagram'],

    log:function (s) {

        if (root.console && Curator.debug) {
            root.console.log(s);
        }
    },

    alert:function (s) {
        if (root.alert) {
            root.alert(s);
        }
    },

    checkContainer:function (container) {
        Curator.log("Curator->checkContainer: "+container);
        if (jQuery(container).length === 0) {
            if (window.console) {
                window.console.log('Curator could not find the element ' + container + '. Please ensure this element existings in your HTML code. Exiting.');
            }
            return false;
        }
        return true;
    },

    checkPowered : function (jQuerytag) {
        Curator.log("Curator->checkPowered");
        var h = jQuerytag.html ();
        // Curator.log (h);
        if (h.indexOf('Curator') > 0) {
            return true;
        } else {
            Curator.alert ('Container is missing Powered by Curator');
            return false;
        }
    },

    augment:augment
};

if (jQuery === undefined) {
    Curator.alert ('Curator requires jQuery. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}




Curator.Client = augment.extend(Object, {
    constructor : function () {
        Curator.log('Client->construct');

    },

    setOptions : function (options, defaults) {

        this.options = jQuery.extend({}, defaults,options);

        if (options.debug) {
            Curator.debug = true;
        }

        // Curator.log(this.options);

        return true;
    },

    init : function () {

        if (!Curator.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = jQuery(this.options.container);

        // if (!Curator.checkPowered(this.$container)) {
        //     return false;
        // }

        this.createFeed();
        this.createPopupManager();

        return true;
    },

    createFeed : function () {
        this.feed = new Curator.Feed ({
            debug:this.options.debug,
            feedId:this.options.feedId,
            feedParams:this.options.feedParams,
            postsPerPage:this.options.postsPerPage,
            apiEndpoint:this.options.apiEndpoint,
            onPostsLoaded:this.onPostsLoaded.bind(this),
            onPostsFail:this.onPostsFail.bind(this)
        });
    },
    
    createPopupManager : function () {
        this.popupManager = new Curator.PopupManager(this);
    },

    loadPosts: function (page) {
        this.feed.loadPosts(page);
    },

    createPostElements : function (posts)
    {
        var that = this;
        var postElements = [];
        jQuery(posts).each(function(){
            var p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    },

    createPostElement: function (postJson) {
        var post = new Curator.Post(postJson);
        jQuery(post).bind('postClick',jQuery.proxy(this.onPostClick, this));

        if (this.options.onPostCreated) {
            this.options.onPostCreated (post);
        }

        return post;
    },

    onPostsLoaded: function (posts) {
        Curator.log('Client->onPostsLoaded');
        Curator.log(posts);
    },

    onPostsFail: function (data) {
        Curator.log('Client->onPostsLoadedFail');
        Curator.log(data);
    },

    onPostClick: function (ev,post) {
        this.popupManager.showPopup(post);
    }
});
jQuery.support.cors = true;

var defaults = {
    postsPerPage:24,
    feedId:'xxx',
    feedParams:{},
    debug:false,
    apiEndpoint:'https://api.curator.io/v1',
    onPostsLoaded:function(data){
        Curator.log('Feed->onPostsLoaded');
        Curator.log(data);
    },
    onPostsFail:function(data) {
        Curator.log('Feed->onPostsFail failed with message');
        Curator.log(data.message);
    }
};

Curator.Feed = function (options) {
    this.init(options);
};

jQuery.extend(Curator.Feed.prototype,{
    loading: false,
    postsLoaded:0,
    postCount:0,
    feedBase:'',
    currentPage:0,

    init: function (options) {
        Curator.log ('Feed->init with options');

        this.options = jQuery.extend({},defaults,options);

        Curator.log(this.options);

        this.feedBase = this.options.apiEndpoint+'/feed';
    },

    loadPosts: function (page, paramsIn) {
        page = page || 0;
        Curator.log ('Feed->loadPosts '+this.loading);
        if (this.loading) {
            return false;
        }
        this.currentPage = page;

        var params = jQuery.extend({},this.options.feedParams,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    },

    _loadPosts : function (params) {
        Curator.log ('Feed->_loadPosts');
        var that = this;

        this.loading = true;

        jQuery.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: {params: params},
            success: function (data) {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    that.postCount = data.postCount;
                    that.postsLoaded += data.posts.length;
                    if (that.options.onPostsLoaded) {
                        that.options.onPostsLoaded(data.posts);
                    }
                } else {
                    if (that.options.onPostsFail) {
                        that.options.onPostsFail(data);
                    }
                }
                that.loading = false;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);

                if (that.options.onPostsFail) {
                    that.options.onPostsFail();
                }
                that.loading = false;
            }
        });
    },  

    loadPost : function (id, successCallback, failCallback) {
        failCallback = failCallback || function(){};
        jQuery.get(this.getUrl('/post/' + id), {}, function (data) {
            if (data.success) {
                successCallback (data.post);
            } else {
                failCallback ();
            }
        });
    },

    inappropriatePost: function (id, reason, success, failure) {
        var params = {
            reason: reason
            // where: {
            //     id: {'=': id}
            // }
        };

        jQuery.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success();
            }
            else {
                failure(jqXHR);
            }
        });
    },

    lovePost: function (id, success, failure) {
        var params = {};

        jQuery.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = jQuery.parseJSON(data);

            if (data.success === true) {
                success(data.loves);
            }
            else {
                failure(jqXHR);
            }
        });
    },

    getUrl : function (trail) {
        return this.feedBase+'/'+this.options.feedId+trail;
    }
});
/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.PopupInappropriate = function (post,feed) {
    this.init(post,feed);
};

jQuery.extend(Curator.PopupInappropriate.prototype, {
    feed: null,
    post:null,

    init: function (post,feed) {
        var that = this;

        this.feed = feed;
        this.post = post;
        
        this.jQueryel = jQuery('.mark-bubble');

        jQuery('.mark-close').click(function (e) {
            e.preventDefault();
            jQuery(this).parent().fadeOut('slow');
        });

        jQuery('.mark-bubble .submit').click(function () {
            var $input = that.$el.find('input.text');

            var reason = jQuery.trim($input.val());

            if (reason) {
                $input.disabled = true;
                jQuery(this).hide();

                that.$el.find('.waiting').show();

                feed.inappropriatePost(that.post.id, reason,
                    function () {
                        $input.val('');
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Thank you');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('This message has been marked as inappropriate').show();
                    },
                    function () {
                        that.$el.find('.waiting').hide();
                        that.$el.find('.title').html('Oops');
                        that.$el.find('input.text').hide();
                        that.$el.find('input.text').html('');
                        that.$el.find('.success-message').html('It looks like a problem has occurred. Please try again later').show();
                    }
                );
            }
        });

        this.$el.fadeIn('slow');
    }
});
/**
* ==================================================================
* Popup Manager
* ==================================================================
*/


Curator.PopupManager = function (curator) {
    // console.log (this);
    this.init(curator);
};


jQuery.extend(Curator.PopupManager.prototype, {
    templateId:'#popup-wrapper-template',
    client:null,

    init: function (client) {
        Curator.log("PopupManager->init ");

        this.client = client;

        this.$wrapper = Curator.Template.render(this.templateId, {});
        this.$popupContainer = this.$wrapper.find('.crt-popup-container');
        this.$underlay = this.$wrapper.find('.crt-popup-underlay');

        jQuery('body').append(this.$wrapper);
        this.$underlay.click(jQuery.proxy(this.onUnderlayClick,this));
        //this.$popupContainer.click(jQuery.proxy(this.onUnderlayClick,this));

    },

    showPopup: function (post) {
        if (this.popup) {
            this.popup.hide(function(){
                this.popup.destroy();
                this.showPopup2(post);
            }.bind(this));
        } else {
            this.showPopup2(post);
        }

    },  

    showPopup2: function (post) {
        this.popup = new Curator.Popup(this, post, this.feed);
        this.$popupContainer.append(this.popup.$popup);

        this.$wrapper.show();
        if (!this.$underlay.is(':visible')) {
            this.$underlay.fadeIn();
        }
        this.popup.show();

        jQuery('body').addClass('crt-popup-visible');

        this.currentPostNum = 0;
        for(var i=0;i < this.posts.length;i++)
        {
            // console.log (post.json.id +":"+this.posts[i].id);
            if (post.json.id == this.posts[i].id) {
                this.currentPostNum = i;
                Curator.log('Found post '+i);
                break;
            }
        }
    },

    setPosts: function (posts) {
        this.posts = posts;
    },

    onClose : function () {
        this.hide();
    },

    onPrevious: function () {
        this.currentPostNum-=1;
        this.currentPostNum = this.currentPostNum>=0?this.currentPostNum:this.posts.length-1; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    },

    onNext: function () {
        this.currentPostNum+=1;
        this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    },

    onUnderlayClick: function (e) {
        Curator.log('PopupManager->onUnderlayClick');
        e.preventDefault();

        this.popup.hide(function(){
            this.hide();
        }.bind(this));

    },

    hide: function () {

        Curator.log('PopupManager->hide');
        jQuery('body').removeClass('crt-popup-visible');
        this.currentPostNum = 0;
        this.popup = null;
        this.$underlay.fadeOut(function(){
            this.$wrapper.hide();
        }.bind(this));
    },
    
    destroy: function () {

        this.$underlay.remove();

        delete this.$popup;
        delete this.$underlay;
    }
});
/**
* ==================================================================
* Popup
* ==================================================================
*/


Curator.Popup = function (json,feed) {
    this.init(json,feed);
};



jQuery.extend(Curator.Popup.prototype, {
    templateId:'#popup-template',
    videoPlaying:false,

    init: function (popupManager, post, feed) {
        Curator.log("Popup->init ");
 
        this.popupManager = popupManager;
        this.json = post.json;
        this.feed = feed;

        this.$popup = Curator.Template.render(this.templateId, this.json);

        if (this.json.network_id === 8)
        {
            // youtube
            this.$popup.find('video').remove();

            var src = '<iframe id="ytplayer" type="text/html" width="615" height="615" \
            src="https://www.youtube.com/embed/'+this.json.source_identifier+'?autoplay=0&rel=0&showinfo" \
            frameborder="0"></iframe>';

            this.$popup.find('.crt-video-container img').remove();
            this.$popup.find('.crt-video-container a').remove();
            this.$popup.find('.crt-video-container').append(src);

        } else if (!this.json.image) {
            this.$popup.addClass('no-image');
        }

        if (this.json.video) {
            this.$popup.addClass('has-video');
        }

        this.$popup.on('click',' .crt-close', jQuery.proxy(this.onClose,this));
        this.$popup.on('click',' .crt-previous', jQuery.proxy(this.onPrevious,this));
        this.$popup.on('click',' .crt-next', jQuery.proxy(this.onNext,this));
        this.$popup.on('click',' .crt-play', jQuery.proxy(this.onPlay,this));

    },

    onClose: function (e) {
        e.preventDefault();
        var that = this;
        this.hide(function(){
            that.popupManager.onClose();
        });
    },

    onPrevious: function (e) {
        e.preventDefault();

        this.popupManager.onPrevious();
    },

    onNext: function (e) {
        e.preventDefault();

        this.popupManager.onNext();
    },

    onPlay: function (e) {
        Curator.log('Popup->onPlay');
        e.preventDefault();

        this.videoPlaying = !this.videoPlaying;

        if (this.videoPlaying) {
            this.$popup.find('video')[0].play();
        } else {
            this.$popup.find('video')[0].pause();
        }

        Curator.log(this.videoPlaying);

        this.$popup.toggleClass('video-playing',this.videoPlaying );
    },

    show: function () {
        //
        // var post = this.json;
        // var mediaUrl = post.image,
        //     text = post.text;
        //
        // if (mediaUrl) {
        //     var $imageWrapper = that.$el.find('div.main-image-wrapper');
        //     this.loadMainImage(mediaUrl, $imageWrapper, ['main-image']);
        // }
        //
        // var $socialIcon = this.$el.find('.social-icon');
        // $socialIcon.attr('class', 'social-icon');
        // $socialIcon.addClass(Curator.SOURCE_TYPES[post.sourceType]);
        //
        // //format the date
        // var date = Curator.Utils.dateAsDayMonthYear(post.sourceCreateAt);
        //
        // this.$el.find('input.discovery-id').val(post.id);
        // this.$el.find('div.full-name span').html(post.user_full_name);
        // this.$el.find('div.username span').html('@' + post.user_screen_name);
        // this.$el.find('div.date span').html(date);
        // this.$el.find('div.love-indicator span').html(post.loves);
        // this.$el.find('div.side-text span').html(text);
        //
        // this.wrapper.show();
        this.$popup.fadeIn(function () {
            // that.$popup.find('.crt-popup').animate({width:950}, function () {
            //     jQuery('.popup .content').fadeIn('slow');
            // });
        });
    },
    
    hide: function (callback) {
        Curator.log('Popup->hide');
        var that = this;
        this.$popup.fadeOut(function(){

            that.destroy();
            callback ();
        });
    },
    
    destroy: function () {
        if (this.$popup && this.$popup.length) {
            this.$popup.remove();

            if (this.$popup.find('video').length) {
                this.$popup.find('video')[0].pause();

            }
        }

        delete this.$popup;
    }
});


/**
* ==================================================================
* Post
* ==================================================================
*/




Curator.Post = augment.extend(Object, {
    templateId:'#post-template',
    defaultTemplateId:'#post-template',

    constructor:function (postJson, templateId) {
        this.templateId = templateId || this.defaultTemplateId;

        this.json = postJson;
        this.$el = Curator.Template.render(this.templateId, postJson);

        this.$el.find('.shareFacebook').click(jQuery.proxy(this.onShareFacebookClick,this));
        this.$el.find('.shareTwitter').click(jQuery.proxy(this.onShareTwitterClick,this));
        this.$el.find('.crt-hitarea').click(jQuery.proxy(this.onPostClick,this));

        this.$post = this.$el.find('.crt-post');

        if (this.json.video) {
            this.$post.addClass('has-video');
        }
    },

    onShareFacebookClick : function (ev) {
        ev.preventDefault();
        Curator.SocialFacebook.share(this.json);
        return false;
    },

    onShareTwitterClick : function (ev) {
        ev.preventDefault();
        Curator.SocialTwitter.share(this.json);
        return false;
    },

    onPostClick : function (ev) {
        ev.preventDefault();
        jQuery(this).trigger('postClick',this, this.json, ev);
    }
});
/* global FB */

Curator.SocialFacebook = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var cb =  function(){};

        FB.ui({
            method: 'feed',
            link: obj.url,
            picture: obj.image,
            name: obj.user_screen_name,
            description: obj.text
        }, cb);
    }
};


Curator.SocialPinterest = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);
        var url = "http://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{text}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'pintrest', '600', '270', '0');
    }
};


Curator.SocialTwitter = {
    share: function (post) {
        var obj = post;
        obj.url = Curator.Utils.postUrl(post);

        var url = "http://twitter.com/share?url={{url}}&text={{text}}&hashtags={{hashtags}}";
        Curator.Utils.popup(Curator.Utils.tinyparser(url, obj), 'twitter', '600', '430', '0');
    }
};


Curator.Templates = {

    postTemplate : ' \
<div class="crt-post-c">\
    <div class="crt-post post<%=id%>"> \
        <div class="crt-post-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-post-content"> \
            <div class="image crt-hitarea crt-post-content-image <%=this.contentImageClasses()%>" > \
                <img src="<%=image%>" /> \
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
            </div> \
            <div class="text crt-post-content-text <%=this.contentTextClasses()%>"> \
                <p class="crt-date"><%=this.prettyDate(source_created_at)%></p> \
                <%=this.parseText(text)%> \
            </div> \
        </div> \
        <div class="crt-post-share">Share <a href="#" class="shareFacebook"><i class="crt-icon-facebook"></i></a>  <a href="#" class="shareTwitter"><i class="crt-icon-twitter-bird"></i></a> </div> \
    </div>\
</div>',

    popupWrapperTemplate : ' <div class="crt-popup-wrapper"> \
<div class="crt-popup-wrapper-c"> \
<div class="crt-popup-underlay"></div> \
<div class="crt-popup-container"></div> \
</div> \
</div>',

    popupTemplate : ' \
<div class="crt-popup"> \
    <a href="#" class="crt-close crt-icon-cancel"></a> \
    <a href="#" class="crt-next crt-icon-right-open"></a> \
    <a href="#" class="crt-previous crt-icon-left-open"></a> \
    <div class="crt-popup-left">  \
        <div class="crt-video"> \
            <div class="crt-video-container">\
                <video src="<%=video%>" type="video/mp3" preload="none"></video>\
                <img src="<%=image%>" />\
                <a href="javascript:;" class="crt-play"><i class="play"></i></a> \
            </div> \
        </div> \
        <div class="crt-image"> \
            <img src="<%=image%>" /> \
        </div> \
    </div> \
    <div class="crt-popup-right"> \
        <div class="crt-popup-header"> \
            <span class="social-icon"><i class="crt-icon-<%=this.networkIcon()%>"></i></span> \
            <img src="<%=user_image%>"  /> \
            <div class="crt-post-name"><span><%=user_full_name%></span><br/><a href="<%=this.userUrl()%>" target="_blank">@<%=user_screen_name%></a></div> \
        </div> \
        <div class="crt-popup-text <%=this.contentTextClasses()%>"> \
            <p class="crt-date"><%=this.prettyDate(source_created_at)%></p> \
            <%=this.parseText(text)%> \
        </div> \
    </div> \
</div>',


    popupUnderlayTemplate : ''
};

Curator.Template = {
    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },
    render: function (templateId, data) {
        var cam = this.camelize(templateId).substring(1);
        var source = '';

        if (jQuery(templateId).length===1)
        {
            source = jQuery(templateId).html();
        } else if (Curator.Templates[cam] !== undefined)
        {
            source = Curator.Templates[cam];
        }

        if (source === '')
        {
            throw new Error ('could not find template '+templateId+'('+cam+')');
        }

        var tmpl = root.parseTemplate(source, data);
        if (jQuery.parseHTML) {
            // breaks with jquery < 1.8
            tmpl = jQuery.parseHTML(tmpl);
        }
        return jQuery(tmpl).filter('div');
    }

};



Curator.Utils = {

    postUrl : function (post)
    {
        if (post.url && post.url !== "")
        {
            // instagram
            return post.url;
        }

        if (post.network_id==="1")
        {
            // twitter
            return 'https://twitter.com/'+post.user_screen_name+'/status/'+post.sourceIdentifier;
        }

        return '';
    },

    center : function (elementWidth, elementHeight, bound) {
        var s = root.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height,
            w = elementWidth,
            h = elementHeight;

        return {
            top: (bH) ? (bH - h) / 2 : 0,
            left: (bW) ? (bW - w) / 2 : 0
        };
    },

    popup :  function (mypage, myname, w, h, scroll) {

        var
            position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        root.open(mypage, myname, settings);
    },

    tinyparser : function (string, obj) {

        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? obj[b] : "";
        });
    }
};


Curator.DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString: function (time) {
        dtstr = time.replace(/\D/g," ");
        var dtcomps = dtstr.split(" ");

        // modify month between 1 based ISO 8601 and zero based Date
        dtcomps[1]--;

        var date = new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));

        return date;
    },

    /**
     * Format the date as DD/MM/YYYY
     */
    dateAsDayMonthYear: function (strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));
        // console.log(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

        var day = myDate.getDate() + '';
        var month = (myDate.getMonth() + 1) + '';
        var year = myDate.getFullYear() + '';

        day = day.length === 1 ? '0' + day : day;
        month = month.length === 1 ? '0' + month : month;

        var created = day + '/' + month + '/' + year;

        return created;
    },

    /**
     * Convert the date into a time array
     */
    dateAsTimeArray: function (strEpoch) {
        var myDate = new Date(parseInt(strEpoch, 10));

        var hours = myDate.getHours() + '';
        var mins = myDate.getMinutes() + '';
        var ampm;

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours = (hours - 12) + '';
            }
        }
        else {
            ampm = 'AM';
        }

        hours = hours.length === 1 ? '0' + hours : hours; //console.log(hours.length);
        mins = mins.length === 1 ? '0' + mins : mins; //console.log(mins);

        var array = [
            parseInt(hours.charAt(0), 10),
            parseInt(hours.charAt(1), 10),
            parseInt(mins.charAt(0), 10),
            parseInt(mins.charAt(1), 10),
            ampm
        ];

        return array;
    }
};

Curator.StringUtils = {

    twitterLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks : function (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","");
            return Curator.StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","");
            return Curator.StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    linksToHref : function (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    url : function (s,t) {
        t = t || s;
        return '<a href="'+s+'" target="_blank">'+t+'</a>';
    }
};


    return Curator;
}));

;(function(root, factory) {
if (typeof define === 'function' && define.amd) {
    // Cheeky wrapper to add root to the factory call
    var factoryWrap = function () { 
        var argsCopy = [].slice.call(arguments); 
        argsCopy.unshift(root);
        return factory.apply(this, argsCopy); 
    };
    define(['jquery', 'curator'], factoryWrap);
} else if (typeof exports === 'object') {
    module.exports = factory(root, require('jquery'), require('curator'));
} else {
    root.Curator.Waterfall = factory(root, root.jQuery, root.Curator);
}
}(this, function(root, jQuery, Curator) {

var widgetDefaults = {
    feedId:'',
    postsPerPage:12,
    maxPosts:0,
    apiEndpoint:'https://api.curator.io/v1',
    scroll:'more',
    gridWidth:250,
    onPostsLoaded:function(){},
    animate:true,
    animateSpeed:400
}; 


var Client = Curator.augment.extend(Curator.Client, {
    containerHeight: 0,
    loading: false,
    feed: null,
    $container: null,
    $feed: null,
    posts:[],
    popupManager:null,
    name:'Waterfall',

    constructor: function (options) {
        this.uber.setOptions.call (this, options,  widgetDefaults);

        Curator.log("Waterfall->init with options:");
        Curator.log(this.options);

        if (this.uber.init.call (this)) {
            this.$scroll = jQuery('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = jQuery('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-feed-container');

            if (this.options.scroll=='continuous') {
                jQuery(this.$scroll).scroll(function () {
                    var height = this.$scroll.height();
                    var cHeight = this.$feed.height();
                    var scrollTop = this.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.loadMorePosts();
                    }
                }.bind(this));
            } else if (this.options.scroll=='none') {
                // no scroll - use javascript to trigger loading
            } else {
                // default to more
                this.$more = jQuery('<div class="crt-feed-more"><a href="#"><span>Load more</span></a></div>').appendTo(this.$scroll);
                this.$more.find('a').on('click',function(ev){
                    ev.preventDefault();
                    this.loadMorePosts();
                }.bind(this));
            }

            this.$feed.gridalicious({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.gridWidth,
                animate:this.options.animate,
                animationOptions: {
                    speed: (this.options.animateSpeed/2),
                    duration: this.options.animateSpeed
                }
            });

            // Load first set of posts
            this.loadPosts(0);
        }
    },
    
    loadPosts : function (page, clear) {
        Curator.log('Waterfall->loadPage');
        if (clear) {
            this.$feed.find('.crt-post-c').remove();
        }
        this.feed.loadPosts(page);
    },

    loadMorePosts : function () {
        Curator.log('Waterfall->loadMorePosts');

        this.feed.loadPosts(this.feed.currentPage+1);
    },

    onPostsLoaded: function (posts) {
        Curator.log("Waterfall->onPostsLoaded");
        
        var postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.$feed.gridalicious('append', postElements);

        this.popupManager.setPosts(posts);

        this.loading = false;
        this.options.onPostsLoaded (this, posts);
    },

    onPostsFailed: function (data) {
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    },

    destroy : function () {
        //this.$feed.slick('unslick');
        this.$feed.remove();
        this.$scroll.remove();
        if (this.$more) {
            this.$more.remove();
        }
        this.$container.removeClass('crt-feed-container');

        delete this.$feed;
        delete this.$scroll;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
});


    return Client;
}));
$.support.cors = true;

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

$.extend(Curator.Feed.prototype,{
    loading: false,
    postsLoaded:0,
    postCount:0,
    feedBase:'',
    currentPage:0,
    posts:[],

    init: function (options) {
        Curator.log ('Feed->init with options');

        this.options = $.extend({},defaults,options);

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

        var params = $.extend({},this.options.feedParams,paramsIn);

        params.limit = this.options.postsPerPage;
        params.offset = page * this.options.postsPerPage;

        this._loadPosts (params);
    },

    loadMore: function (paramsIn) {
        Curator.log ('Feed->loadMore '+this.loading);
        if (this.loading) {
            return false;
        }

        var params = {
            limit:this.options.postsPerPage
        };
        $.extend(params,this.options.feedParams, paramsIn);

        params.offset = this.posts.length;

        this._loadPosts (params);
    },

    _loadPosts : function (params) {
        Curator.log ('Feed->_loadPosts');
        var that = this;

        this.loading = true;

        $.ajax({
            url: this.getUrl('/posts'),
            dataType: 'json',
            data: params,
            success: function (data) {
                Curator.log('Feed->_loadPosts success');

                if (data.success) {
                    that.postCount = data.postCount;
                    that.postsLoaded += data.posts.length;

                    that.posts = that.posts.concat(data.posts);

                    console.log (that.posts);
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
        $.get(this.getUrl('/post/' + id), {}, function (data) {
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

        $.post(this.getUrl('/post/' + id + '/inappropriate'), params, function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);

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

        $.post(this.getUrl('/post/' + id + '/love'), params, function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);

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

Curator.Client = augment.extend(Object, {
    constructor : function () {
        Curator.log('Client->construct');

    },

    setOptions : function (options, defaults) {

        this.options = $.extend({}, defaults,options);

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

        this.$container = $(this.options.container);

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
        $(posts).each(function(){
            var p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    },

    createPostElement: function (postJson) {
        var post = new Curator.Post(postJson, this.options, this);
        $(post).bind('postClick',$.proxy(this.onPostClick, this));
        $(post).bind('postReadMoreClick',$.proxy(this.onPostClick, this));

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
    },

    track : function (a) {
        Curator.log('Feed->track '+a);

        $.ajax({
            url: this.getUrl('/track/'+this.options.feedId),
            dataType: 'json',
            data: {a:a},
            success: function (data) {
                Curator.log('Feed->track success');
                Curator.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Curator.log('Feed->_loadPosts fail');
                Curator.log(textStatus);
                Curator.log(errorThrown);
            }
        });
    },

    getUrl : function (trail) {
        return this.options.apiEndpoint+trail;
    }
});
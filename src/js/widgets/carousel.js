

Curator.Config.Carousel = $.extend({}, Curator.Config.Defaults, {
    scroll:'more',
    carousel:{
        autoPlay:true,
        autoLoad:true
    },
});

class Carousel extends Client {

    constructor (options) {
        super ();

        this.setOptions (options,  Curator.Config.Carousel);

        this.containerHeight=0;
        this.loading=false;
        this.posts=[];
        this.firstLoad=true;

        Curator.log("Carousel->init with options:");
        Curator.log(this.options);

        if (this.init (this)) {

            this.allLoaded = false;

             let that = this;

            // this.$wrapper = $('<div class="crt-carousel-wrapper"></div>').appendTo(this.$container);
            this.$feed = $('<div class="crt-feed"></div>').appendTo(this.$container);
            this.$container.addClass('crt-carousel');

            this.carousel = new window.CCarousel(this.$feed, this.options.carousel);
            this.$feed.on('curatorCarousel:changed', function (event, carousel, currentSlide) {
                console.log('curatorCarousel:changed '+currentSlide);
                // console.log('curatorCarousel:changed '+(that.feed.postsLoaded-carousel.PANES_VISIBLE));
                // console.log(carousel.PANES_VISIBLE);
                if (that.options.carousel.autoLoad) {
                    // if (currentSlide >= that.feed.postsLoaded - carousel.PANES_VISIBLE) {
                    that.loadMorePosts();
                    // }
                }
            });

            // load first set of posts
            this.loadPosts(0);
        }
    }

    loadMorePosts  () {
        Curator.log('Carousel->loadMorePosts');

        if (this.feed.postCount > this.feed.postsLoaded) {
            this.feed.loadPosts(this.feed.currentPage + 1);
        }
    }

    onPostsLoaded (posts) {
        Curator.log("Carousel->onPostsLoaded");

        this.loading = false;

        if (posts.length === 0) {
            this.allLoaded = true;
        } else {
             let that = this;
             let $els = [];
            $(posts).each(function(i){
                let p = that.createPostElement(this);
                $els.push(p.$el);

                if (that.options.animate && that.firstLoad) {
                    p.$el.css({opacity: 0});
                    setTimeout(function () {
                        console.log (i);
                        p.$el.css({opacity: 0}).animate({opacity: 1});
                    }, i * 100);
                }
            });

            this.carousel.add($els);
            this.carousel.update();

            // that.$feed.c().trigger('add.owl.carousel',$(p.$el));

            this.popupManager.setPosts(posts);

            this.options.onPostsLoaded (this, posts);
        }
        this.firstLoad = false;
    }
    
    onPostsFail (data) {
        Curator.log("Carousel->onPostsFail");
        this.loading = false;
        this.$feed.html('<p style="text-align: center">'+data.message+'</p>');
    }

    destroy  () {
        this.carousel.destroy();
        this.$feed.remove();
        this.$container.removeClass('crt-carousel');

        delete this.$feed;
        delete this.$container;
        delete this.options ;
        delete this.feed.postsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }

}


Curator.Carousel = Carousel;
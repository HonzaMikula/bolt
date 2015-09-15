window.app = {};

(function () {
  var app = {

    trackTwitter: function() {
      var that = this;

      if (typeof twttr !== 'undefined') {
        twttr.ready(function (twttr) {
          twttr.events.bind('click', function(intent) {
            if (intent)
              ga('send', 'social', 'twitter', 'click', intent.region);
          });

          twttr.events.bind('tweet', function(intent) {
            if (intent)
              ga('send', 'social', 'twitter', 'tweet', window.location.href);
          });


          twttr.events.bind('retweet',  function(intent) {
            if (intent)
              ga('send', 'social', 'twitter', 'retweet', window.location.href);
          });

          twttr.events.bind('favorite', function(intent) {
            if (intent)
              ga('send', 'social', 'twitter', 'favorite', window.location.href);
          });

          twttr.events.bind('follow', function(intent) {
            if (intent)
              ga('send', 'social', 'twitter', 'follow', window.location.href);
          });
        });
      }
    },

    trackFacebook: function() {
      if (typeof FB !== 'undefined') {
        //Facebook Likes
        FB.Event.subscribe('edge.create', function (href, widget) {
          var currentPage = jQuery(document).attr('title');
          ga('send', {
            'hitType': 'social',
            'socialNetwork': 'Facebook',
            'socialAction': 'Like',
            'socialTarget': href
          });
        });

        //Facebook Unlikes
        FB.Event.subscribe('edge.remove', function (href, widget) {
          var currentPage = jQuery(document).attr('title');
          ga('send', {
            'hitType': 'social',
            'socialNetwork': 'Facebook',
            'socialAction': 'Unlike',
            'socialTarget': href
          });
        });

        //Facebook Send/Share
        FB.Event.subscribe('message.send', function (href, widget) {
          var currentPage = jQuery(document).attr('title');
          ga('send', {
            'hitType': 'social',
            'socialNetwork': 'Facebook',
            'socialAction': 'Send',
            'socialTarget': href
          });
        });

        //Facebook Comments
        FB.Event.subscribe('comment.create', function (href, widget) {
          var currentPage = jQuery(document).attr('title');
          ga('send', {
            'hitType': 'social',
            'socialNetwork': 'Facebook',
            'socialAction': 'Comment',
            'socialTarget': href
          });
        });
      }
    },


    initHomepage: function() {
      $('header').outboundAnalytics();

      $('header form').submit(function() {
        var category = 'homepage';
        var action = 'subscription';
        var label = $(this).find('input[type="email"]').val();

        ga('send', 'event', category, action, label);
      });

      this.trackTwitter();
    },

    initArticle: function() {
      var that = this;
      $('body > footer').outboundAnalytics();
      $('article').outboundAnalytics();

      $('footer form').submit(function() {
        var category = 'article';
        var action = 'subscription';
        var label = $(this).find('input[type="email"]').val();

        ga('send', 'event', category, action, label);
      });

      $('.kindleWidget').on('click', function() {
        ga('send', 'event', 'article', 'send to kindle', window.location.href);
      });

      that.trackTwitter();
      window.fbAsyncInit = function() {
        that.trackFacebook();
      }

    }
  }

  window.app = app;

}).call(this);

(function($) {

  $.fn.outboundAnalytics = function(options) {

    var action = $(this).prop("tagName").toLowerCase();

    if (action == 'body')
      action = '';
    else
      action = ' - '+ action;

    var defaults = {
      category: function () { return $('body').attr('id'); },
      action: 'outbound'+ action,
      label: function () { return $(this).attr('href'); },
      nonInteraction: false
    },
    settings = $.extend({}, defaults, options);

    return this.find('a[href]').filter(function () {
      return (this.host !== location.host);
    }).click(function() {
      var params = {}, link = this;

      $.each(settings, function (key, value) {
        params[key] = ($.isFunction(value)) ? value.call(link) : value;
      });

      try {
        ga('send', 'event', params.category, params.action, params.label, params.value);
      } catch (e) {
        // do something in the future
      }
    }).end().end();
  };

  $.outboundAnalytics = function(options) {
    $('body').outboundAnalytics(options);
  };

}(jQuery));

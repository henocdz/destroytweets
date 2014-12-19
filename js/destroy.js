(function() {
  var NETWORK, TWITTER_CLIENT_ID;

  TWITTER_CLIENT_ID = 'lWOzgSMmYPd5zQmvWxmyL82Bo';

  NETWORK = 'twitter';

  $(function() {
    var deleteTweet, feed, isLoggedIn, listTweets, login_btn, logout_btn, renderTweet, retrieveTweets, switchButtons, total, tweetsList, updateTweets;
    login_btn = $('#login_btn');
    logout_btn = $('#logout_btn');
    feed = $('#feed');
    tweetsList = [];
    hello.init({
      twitter: TWITTER_CLIENT_ID
    }, {
      redirect_uri: ''
    });
    renderTweet = function(id, text, date) {
      var html;
      html = $("<div class=\"tweet\">\n    <p>" + text + "</p>\n    <a href=\"#\" class=\"delete-link\" title=\"Delete\" alt=\"Delete\" data-tweet-id=\"" + id + "\"><i class=\"fa fa-trash\"/></a>\n</div>");
      return html;
    };
    retrieveTweets = function(callback, max_id) {
      var opts;
      max_id = max_id || null;
      opts = {
        include_rts: false,
        exclude_replies: true,
        count: 200
      };
      if (max_id) {
        opts['max_id'] = max_id;
      }
      return hello('twitter').api('https://api.twitter.com/1.1/statuses/user_timeline.json', 'get', opts).then(function(tweets) {
        if (callback) {
          return callback(tweets);
        }
      }, function(e) {
        if (callback) {
          return callback(null, e);
        }
      });
    };
    deleteTweet = function(callback, id) {
      var uri;
      uri = "https://api.twitter.com/1.1/statuses/destroy/" + id + ".json";
      return hello('twitter').api(uri, 'post').then(function(res) {
        if (callback) {
          return callback(res);
        }
      }, function(e) {
        if (callback) {
          return callback(null, e);
        }
      });
    };
    total = 0;
    listTweets = function(tweets, e) {
      var first_tweet, last_tweet, max_id, oldest_tweet, tweet, _i, _len;
      if (!e && tweets) {
        total += tweets.length;
        if (tweets.length > 0) {
          oldest_tweet = tweets[tweets.length - 1];
          max_id = oldest_tweet.id;
        }
        first_tweet = tweets[0];
        last_tweet = tweets[tweets.length - 1];
        for (_i = 0, _len = tweets.length; _i < _len; _i++) {
          tweet = tweets[_i];
          feed.append(renderTweet(tweet.id_str, tweet.text));
        }
        if (total < 20 && !(first_tweet.id === last_tweet.id)) {
          return retrieveTweets(listTweets, max_id);
        }
      } else {
        return console.log(e);
      }
    };
    updateTweets = function() {
      total = 0;
      return retrieveTweets(listTweets);
    };
    isLoggedIn = function(network) {
      var current_time, session;
      session = hello(network).getAuthResponse();
      current_time = (new Date()).getTime() / 1000;
      return session && session.access_token && session.expires > current_time;
    };
    switchButtons = function(out) {
      if (out) {
        login_btn.show();
        return logout_btn.hide();
      } else {
        logout_btn.show();
        return login_btn.hide();
      }
    };
    logout_btn.on('click', function(e) {
      e.preventDefault();
      return hello.logout('twitter').then(function() {
        switchButtons(true);
        return feed.text('');
      }, function(e) {
        return alert('Error');
      });
    });
    login_btn.on('click', function(e) {
      e.preventDefault();
      return hello.login('twitter').then(function() {
        switchButtons();
        return retrieveTweets(listTweets);
      }, function(e) {
        return alert('Error');
      });
    });
    feed.on('click', 'a.delete-link', function(e) {
      var id, that;
      e.preventDefault();
      that = $(this);
      id = that.data('tweet-id') || null;
      if (id) {
        that.parent('div').css('opacity', 0.5);
        return deleteTweet(function(res, e) {
          if (!e && !res.errors) {
            return that.parent('div').remove();
          }
        }, id);
      }
    });
    if (isLoggedIn('twitter')) {
      switchButtons();
      retrieveTweets(listTweets);
      return this;
    }
  });

}).call(this);

var Trakt = require('trakt.tv');
var trakttv = new Trakt({
    client_id: '',
    client_secret: ''
});
var trakt = {
    // this allows the user to open trakt in browser, log in, authorize powder & get a pin
    // TODO: openExternal() to replace by smth to open 'url' in default browser (or new window)
    openTraktAuth: function () {
        var url = trakttv.get_url();
        //openExternal(url); // -> in default browser
    },

    // this will exchange user's pasted pin for a set of tokens
    // @param pin = the pin the user pasted back in powder
    exchangePin: function (pin) {
        trakttv.exchange_code(pin).then(function (result) {
            localStorage.traktTokens = trakttv.export_token(); // store tokens in app
        }).catch(function (err) {
            console.error('Trakt exchange pin failed', err);
        });
    },

    // this is called on app start to relogin user
    // TODO: use a promise to know if user is logged in or not (to change settings accordingly)
    autoLogin: function () {
        if (!localStorage.traktTokens || localStorage.traktTokens == '') {
            throw new Error('This is not how this works, this is not how any of this works!');
        }
        trakttv.import_token(localStorage.traktTokens).then(function (tokens) {
            localStorage.traktTokens = trakttv.export_token(); // store tokens in app
        }).catch(function (err) {
            console.error('Trakt auto login failed', err);
        });
    },

    // call to scrobble
    // @param state = 'start', 'pause', 'stop';
    // @param percent = float between 1-100 of progress percentage
    // @param id = the imdbid of the movie/episode
    // @param type = 'movie' or 'episode';
    scrobble: function (state, percent, id, type) {
        var item = {
            progress: percent
        };
        item[type] = {
            ids: {
                imdb: id
            }
        };
        trakttv.scrobble[state](item).catch(function (err) {
            console.error('Trakt scrobble failed', err);
        });
    },

    // search on trakt
    // RETURNS A PROMISE ATM
    // todo: parse here?
    // todo: cleanse 'query' before searching?
    search: function (query) {
        return trakttv.search({query: query});
    }
};
App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('sessions', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
});

App.SessionsNewRoute = Ember.Route.extend({
    actions: {
        createSession: function() {
            var router = this;
            var loginOrEmail = this.controller.get('loginOrEmail');
            var password = this.controller.get('password');
            if (!Ember.isEmpty(loginOrEmail) && !Ember.isEmpty(password)) {
                $.post('/session', {
                    session: { login_or_email: loginOrEmail, password: password }
                }, function(sourceData) {
                    var data = JSON.parse(sourceData);
                    var authToken = data.session.auth_token;
                    App.store.authToken = authToken;
                    App.Auth = Ember.Object.create({
                        authToken: data.session.auth_token,
                        accountId: data.session.account_id
                    });
                    router.transitionTo('index');
                });
            }

            // store to cookie
            $.cookie('auth_token', App.Auth.get('authToken'));
            $.cookie('auth_account', App.Auth.get('accountId'));
        }
    }
});

App.AuthenticatedRESTAdapter = DS.RESTAdapter.extend({
    ajax: function(url, type, hash) {
        hash         = hash || {};
        hash.headers = hash.headers || {};
        hash.headers['X-AUTHENTICATION-TOKEN'] = this.authToken;
        return this._super(url, type, hash);
    }
});

DS.rejectionHandler = function(reason) {
    if (reason.status === 401) {
        App.Auth.destroy();
    }
    throw reason;
};

App.AuthenticatedRoute = Ember.Route.extend({
    enter: function() {
        if (!Ember.isEmpty(App.Auth.get('authToken')) && !Ember.isEmpty(App.Auth.get('accountId'))) {
            this.transitionTo('sessions.new');
        }
    }
});

App.Session = DS.Model.extend({
    authToken: DS.attr('string'),
    account:   DS.belongsTo('App.Account')
});

App.AuthManager = Ember.Object.extend({
    init: function() {
        this._super();
        var authToken     = $.cookie('auth_token');
        var authAccountId = $.cookie('auth_account');
        if (!Ember.isEmpty(authToken) && !Ember.isEmpty(authAccountId)) {
            this.authenticate(authToken, authAccountId);
        }
    },

    isAuthenticated: function() {
        return !Ember.isEmpty(this.get('session.authToken')) && !Ember.isEmpty(this.get('session.account'));
    },

    authenticate: function(authToken, accountId) {
        var account = App.Account.find(accountId);
        this.set('session', App.Session.createRecord({
            authToken: authToken,
            account:   account
        }));
    },

    reset: function() {
        this.set('session', null);
    },

    sessionObserver: function() {
        App.Store.authToken = this.get('session.authToken');
        if (Ember.isEmpty(this.get('session'))) {
            $.removeCookie('auth_token');
            $.removeCookie('auth_account');
        } else {
            $.cookie('auth_token', this.get('session.authToken'));
            $.cookie('auth_account', this.get('session.account.id'));
        }
    }.observes('session')
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return ['red', 'yellow', 'blue'];
    }
});

/*
Ember.Application.initializer({
    name: 'session',

    initialize: function(container, application) {
        App.Session = Ember.Object.extend({
            init: function() {
                this._super();
                this.set('authToken', $.cookie('auth_token'));
                this.set('authAccountId', $.cookie('auth_account'));
            },

            authTokenChanged: function() {
                $.cookie('auth_token', this.get('authToken'));
            }.observes('authToken'),

            authAccountIdChanged: function() {
                var authAccountId = this.get('authAccountId');
                $.cookie('auth_account', authAccountId);
                if (!Ember.isEmpty(authAccountId)) {
                    this.set('authAccount', App.Account.find(authAccountId));
                }
            }.observes('authAccountId')
        }).create();
    }
});*/
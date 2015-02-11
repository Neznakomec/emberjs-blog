App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('sessions', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
    this.route('securePage', {path: '/securepage'});
    this.route('logout', {path: '/logout'});
});

// LOGOUT added
App.LogoutRoute = Ember.Route.extend({
    actions: {
        didTransition: function() {
            var self = this;
            //alert('logout fired');
            this.controller.set('logoutMessage', 'You have successfully logged out');
            this.controllerFor('sessions.new').setProperties({token: '', account_id: ''});
            localStorage.removeItem('token');
            localStorage.removeItem('account_id');

            setTimeout(function () {
                self.transitionTo('index');
            }, 2000);

        }
    }
});

// SESSION CREATION ROUTE
App.SessionsNewController = Ember.Controller.extend({
    //errorMessage: '',
    token: localStorage["token"],
    account_id: localStorage["account_id"],

    tokenChanged: function () {
        localStorage["token"] = this.get('token');
        localStorage["account_id"] = this.get('account_id');
    }.observes('token'),


    reset: function(){
        this.setProperties({
            loginOrEmail: "",
            password: "",
            errorMessage: ""
        })
    },

    events:
    {
        error: function(reason, transition) {
            alert('eeerrooorrr');
        }
    }
});

App.SessionsNewRoute = Ember.Route.extend({
    setupController: function(controller, model){
    controller.reset();
    },


    actions: {
        createSession: function() {
            var self = this;
            var loginOrEmail = this.controller.get('loginOrEmail');
            var password = this.controller.get('password');
            if (!Ember.isEmpty(loginOrEmail) && !Ember.isEmpty(password)) {
                var sessionObject = {
                    session: {login_or_email: loginOrEmail, password: password}
                };

                self.controller.set('errorMessage', '');
                $.post('/session', sessionObject, function(sourceData) {
                    var data = JSON.parse(sourceData);
                    if (data.session.success)
                    {
                        alert('login succeeded');
                        self.controller.set('token', data.session.auth_token);
                        self.controller.set('account_id', data.session.account_id);
                        //localStorage["token"] = data.session.auth_token;
                        //localStorage["account_id"] = data.session.account_id;
                        self.transitionTo('securePage');
                    }
                    else
                    {
                        // alert('auth error' + data.session.message);
                        self.controller.set('errorMessage', data.session.message);
                    }
                });
            }
        }
    }
});

// SESSION SUPPORT PART
App.AuthenticatedRoute = Ember.Route.extend({
    getJSONWithToken: function (url) {
        var token = this.controllerFor('sessions.new').get('token');
        var userId = this.controllerFor('sessions.new').get('account_id');
        return $.getJSON(url, {token: token, uid: userId});
    },

    beforeModel: function(transition) {
        if (!this.controllerFor('sessions.new').get('token')) {
            this.redirectToLogin(transition);
        }
    },

    redirectToLogin: function(transition) {
        alert('You must log in!');

        var loginController = this.controllerFor('sessions.new');
        loginController.set('attemptedTransition', transition);
        this.transitionTo('sessions.new');
    }
});

App.SecurePageRoute = App.AuthenticatedRoute.extend({
    model: function() {
        return this.getJSONWithToken('/securepage.json');
    }
});
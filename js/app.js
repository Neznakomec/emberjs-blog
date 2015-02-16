App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('session', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
    //this.route('articles', {path: '/articles'});
    this.resource('articles', function(){
       this.resource('article', {path: ':article_id'});
    });

    this.route('register', {path: '/register'});
    this.route('logout', {path: '/logout'});
});

// LOGOUT added
App.LogoutRoute = Ember.Route.extend({
    actions: {
        didTransition: function() {
            var self = this;
            //alert('logout fired');
            this.controller.set('logoutMessage', 'You have successfully logged out');
            this.controllerFor('session.new').setProperties({token: '', account_id: ''});
            localStorage.removeItem('token');
            localStorage.removeItem('account_id');

            setTimeout(function () {
                self.transitionTo('index');
            }, 2000);

        }
    }
});

// SESSION CREATION ROUTE
App.SessionNewController = Ember.Controller.extend({
    //errorMessage: '',
    token: localStorage["token"],
    account_id: localStorage["account_id"],

    tokenChanged: function () {
        localStorage["token"] = this.get('token');
        localStorage["account_id"] = this.get('account_id');
    }.observes('token', 'account_id'),


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

App.SessionNewRoute = Ember.Route.extend({
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
                        var attemptedTransition = self.controller.get('attemptedTransition');
                        if (attemptedTransition)
                        {
                            attemptedTransition.retry();
                            self.controller.set('attemptedTransition', null);
                        }
                        else {
                            self.transitionTo('index');
                        }
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
        var token = this.controllerFor('session.new').get('token');
        var userId = this.controllerFor('session.new').get('account_id');
        return $.getJSON(url, {token: token, uid: userId});
    },

    postJSONWithToken: function (url) {
        var loginController = this.controllerFor('session.new');
        var sessionProperties = loginController.getProperties('token', 'account_id');
        return $.post(url, sessionProperties, null, 'json');
    },

    beforeModel: function(transition) {
        if (!this.controllerFor('session.new').get('token')) {
            this.redirectToLogin(transition);
        }
    },

    redirectToLogin: function(transition) {
        alert('You must log in!');

        var loginController = this.controllerFor('session.new');
        loginController.set('attemptedTransition', transition);
        var tr = loginController.get('attemptedTransition');
        this.transitionTo('session.new');
    }
});

App.ArticlesRoute = App.AuthenticatedRoute.extend({
    model: function() {
        // return this.getJSONWithToken('/articles.json');
        return this.postJSONWithToken('/articles.json');
    }

});

App.ArticleRoute = App.AuthenticatedRoute.extend({
    model: function (params) {
        var articles = this.modelFor('articles');
        if (articles)
        {
            if (articles[params.article_id - 1])
            return articles[params.article_id - 1];
        }
    }
});

// Register route

App.RegisterController = Ember.Controller.extend({
    errorMessage: '',
    notifyMessage: '',
    a : 0,
    reset: function () {
        this.setProperties({errorMessage: '', notifyMessage: ''});
        this.setProperties({loginOrEmail: '', password: ''});
    },

    printError: function (message) {
        this.setProperties({notifyMessage: '', errorMessage: message});
    },
    printNotify: function (message) {
        this.setProperties({notifyMessage: message, errorMessage: ''});
    },

    actions:
    {
        register: function()
        {
            var self = this;
            var registrationData = this.getProperties('loginOrEmail', 'password');
            if (!registrationData.loginOrEmail)
            {
                this.printError('Please enter user name');
                return;
            };
            if (!registrationData.password)
            {
                this.printError('Please enter password');
                return;
            };
            $.post('/register', registrationData, function (data) {
                if (data.success) {
                    self.printNotify(data.message);
                }
                else {
                    self.printError(data.message);
                }
            }, 'json');
        },

        checkLogin: function()
        {
            var self = this;
            var login = this.get('loginOrEmail');
            if (login)
            {
                var queryObject = {
                    username: login
                };

                $.post('/checkLogin', queryObject, function (data) {
                    if (data.success) {
                        self.printError('Login is took by another user. Please choose another one');
                    }
                    else {
                        self.printNotify('Login is free');
                    }
                }, 'json');
            }
            else
            {
                this.printError('login field is empty. please enter something');
            }
        }
    }
});

App.RegisterRoute = Ember.Route.extend({
    setupController: function(controller, model){
        controller.reset();
    }
});

App.IndexRoute = App.AuthenticatedRoute.extend({
    model: function () {
        return this.postJSONWithToken('/articles.json');
    },
    renderTemplate: function () {
       this.render('articles');
    }
});

var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
    return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.helper('format-date', function(date) {
    return moment(date).fromNow();
});
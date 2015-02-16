App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('session', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
    //this.route('articles', {path: '/articles'});
    this.resource('articles', {path: '/articles'} ,function(){
       this.resource('article', {path: ':article_id'});
        this.route('create', {path: 'create'});
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
            this.controllerFor('session.new').setProperties({token: '', account_id: '', username: ''});
            localStorage.removeItem('token');
            localStorage.removeItem('account_id');
            localStorage.removeItem('username');

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
    username: localStorage["username"],

    tokenChanged: function () {
        localStorage["token"] = this.get('token');
        localStorage["account_id"] = this.get('account_id');
        localStorage["username"] = this.get('username');
        this.controllerFor('application').set('isLogged', this.get('token') ? true: false);
    }.observes('token', 'account_id', 'username'),

    reset: function(){
        this.setProperties({
            loginOrEmail: "",
            password: "",
            errorMessage: ""
        })
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
                        self.controller.set('username', self.controller.get('loginOrEmail'));
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

    postJSONWithToken: function (url, postObject) {
        if (postObject == null || postObject == undefined)
        {
            alert('you given a null post object, please use postJSONWithToken(url)');
        }
        var loginController = this.controllerFor('session.new');
        var sessionProperties = loginController.getProperties('token', 'account_id');
        $.extend(sessionProperties, postObject);
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
    },

    getUsername: function()
    {
        if (localStorage["username"])
        return localStorage["username"];
        else
        {
            return this.controllerFor('session.new').get('username');
        }
    }
});

// version that don't need a login
App.FreeAccessRoute = Ember.Route.extend({
    getJSONWithToken: function (url) {
        var token = this.controllerFor('session.new').get('token');
        var userId = this.controllerFor('session.new').get('account_id');
        return $.getJSON(url, {token: token, uid: userId});
    },

    postJSONWithToken: function (url) {
        var loginController = this.controllerFor('session.new');
        var sessionProperties = loginController.getProperties('token', 'account_id');
        return $.post(url, sessionProperties, null, 'json');
    }
});
//

App.ArticlesRoute = App.FreeAccessRoute.extend({
    model: function() {
        // return this.getJSONWithToken('/articles.json');
        // return this.postJSONWithToken('/articles.json');
        //blank model, add data loading in ArticlesIndex
    }

});

App.ArticlesIndexRoute = App.FreeAccessRoute.extend({
    model: function() {
        return this.postJSONWithToken('/articles.json');
    }

});

App.ArticleRoute = App.FreeAccessRoute.extend({
    model: function (params) {
        //articles.index is BROTHER for article_id router
        //so modelFor doesn't work
        var articles = this.modelFor('articles.index');
        if (articles) {
            if (articles[params.article_id - 1])
                return articles[params.article_id - 1];
        }
    }
});

App.ArticlesCreateRoute = App.AuthenticatedRoute.extend({

    setupController: function(controller, model) {
        controller.set('model', model);
        controller.set('username', this.getUsername());
    },
    actions:
    {
        publish: function() {
            var self = this;
            var article = new Object();
            article["title"] = self.controller.get('title');
            article["author"] = {name: self.getUsername()};
            article["date"] = Date.now();
            article["excerpt"] = this.controller.get('excerpt');
            article["body"] = this.controller.get('body');
            if (!article["excerpt"])
            {
                article.excerpt = article.body.substr(0, article.body.length / 3) + "...";
            }

            var articleAdding = this.postJSONWithToken('/addArticle', article);
            
            articleAdding.then(function (data) {
                    self.controller.set('savedMessage', data.message);

            });
        }
    }
});

// Register route

App.RegisterController = Ember.Controller.extend({
    errorMessage: '',
    notifyMessage: '',
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

App.IndexRoute = App.FreeAccessRoute.extend({
    model: function () {
        return this.postJSONWithToken('/articles.json');
    },

    renderTemplate: function () {
       this.render('articles');
    }
});

App.ApplicationController = Ember.Controller.extend({
    isLogged: localStorage["token"]
});

var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
    return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.helper('format-date', function(date) {
    return moment(date).fromNow();
});
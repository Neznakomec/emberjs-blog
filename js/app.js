App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('sessions', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
    this.route('securePage', {path: '/securepage'});
});


// SESSION CREATION ROUTE
App.SessionsNewController = Ember.Controller.extend({
    //token: '',
    //account_id: '',
    //errorMessage: '',
    reset: function(){
        this.setProperties({
            loginOrEmail: "",
            password: "",
            errorMessage: ""
        })
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
                        localStorage["token"] = data.session.auth_token;
                        localStorage["account_id"] = data.session.account_id;
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

});

App.SecurePageRoute = App.AuthenticatedRoute.extend({
    model: function() {
        var controller = this.controllerFor('sessions.new');
        var token = this.controllerFor('sessions.new').get('token');
        var userId = this.controllerFor('sessions.new').get('account_id');
        return $.getJSON('/securepage.json', {token: token, uid: userId});
    }
});
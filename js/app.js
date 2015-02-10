App = Ember.Application.create();

App.Router.map(function() {
    // put your routes here
    this.resource('sessions', {path: '/session'}, function () {
        this.route('new', {path: '/new'});
    });
    this.route('securePage', {path: '/securepage'});
});

App.AuthenticatedRoute = Ember.Route.extend({

});

App.SessionsNewController = Ember.Controller.extend({
    token: '',
    account_id: '',
    errorMessage: ''
});

App.SessionsNewRoute = Ember.Route.extend({
    actions: {
        createSession: function() {
            var self = this;
            var loginOrEmail = this.controller.get('loginOrEmail');
            var password = this.controller.get('password');
            if (!Ember.isEmpty(loginOrEmail) && !Ember.isEmpty(password)) {
                var sessionObject = {
                    session: {login_or_email: loginOrEmail, password: password}
                };

                $.post('/session', sessionObject, function(sourceData) {
                    var data = JSON.parse(sourceData);
                    if (data.session.success)
                    {
                        self.set('token', data.session.auth_token);
                        self.set('account_id', data.session.account_id);
                        localStorage["token"] = data.session.auth_token;
                        localStorage["account_id"] = data.session.account_id;
                        //router.transitionTo('index');
                        self.controller.set('errorMessage', '');
                    }
                    else
                    {
                        // alert('auth error' + data.session.message);
                        self.controller.set('errorMessage', data.session.message);
                    }
                });
            }

            // store to cookie
            $.cookie('auth_token', data.session.auth_token);
            $.cookie('auth_account', data.session.account_id);
        }
    }
});


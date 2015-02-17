# emberjs-blog
An exaple Blog App with using client Ember.js and server Node.js with MongoDB

#Goal
The main goal was to create a Blog Website

in a form of Single Page App

using Ember.js or Angular.js framework.

Back-end should be implemented as Node.js app, but it is possible to use another tool.

# App launching

App launches by using
<pre> node nodeapp.js </pre>
But this app needs **MongoDB** database to be launched.
By default it connecting to db at address
<pre>mongodb://localhost:27017/blog</pre>
If you have different address, please change it in 
<pre> /dblibs/config.js</pre>

# Implementation process
- 1) At first was done an authentification mechanism
In searching how to do this, I found a [Simplabs blog][simplabs], where was something about these topic.

But this implementation was too advanced and hard to understand, so I used another one from [Ember casts][castlink]. It was a learning example, so code was a little bit "bad written" for a real application. I changed it in future.

For a first time I implemented a "fake" user check on node js, mostly used $.get, $.post from jQuery.

On the Node.js server I don't use popular **Express framework**, 

but implemented a route-handlers approach that learned before on [Node beginner's site][nodebeginner]

- 2) Made a site "header" (written a template with links using {{link-to}} helper)

- 3) Then added an Articles Route, Implemented a work with MongoDB

To get with MongoDB I viewed a good screencasts from [javascript.ru][mongocasts] (part 2, casts 4, 5, 6)

Then I switched users to DB - used Mongoose, written a "User" model.
- 4) Included [auto-increment][autoplugin] plugin.
- 5) In the same way added Article and Comment models, added corresponding routes and templates in Ember.

<!-- LINKS -->


[simplabs]:     http://log.simplabs.com/
[castlink]: http://www.embercasts.com/episodes/client-side-authentication-part-1
[nodebeginner]:      http://nodebeginner.ru/
[mongocasts]:         http://learn.javascript.ru/nodejs-screencast
[autoplugin]: https://www.npmjs.com/package/mongoose-auto-increment
var assert = require('assert');
var express = require('express');
var superagent = require('superagent');
var wagner = require('wagner-core');
var mongoose = require('mongoose');
var status = require('http-status');
var URL_ROOT = 'http://localhost:3000';

describe('User API', function() {
  var server;
  var Product;
  var Category;
  var User;

  before(function() {
    var app = express();

    models = require('../models')(wagner);

    Product = models.Product;
    Category = models.Category;
    User = models.User;

    app.use(function(req, res, next) {
      User.findOne({}, function(error, user) {
        assert.ifError(error);
        req.user = user;
        next();
      });
    });

    app.use(require('../api')(wagner));

    server = app.listen(3000);
  });

  after(function() {
    server.close();
    mongoose.connection.close();
  });

  beforeEach(function(done) {
    Category.remove({}, function(error) {
      assert.ifError(error);
    });

    Product.remove({}, function(error) {
      assert.ifError(error);
    });

    var users = [{
      profile: {
        username: 'vkarpov15',
        picture: 'http://pbs.twimg.com/profile_images/550304223036854272/Wwmwuh2t.png'
      },
      data: {
        oauth: 'invalid',
        cart: []
      }
    }];

    User.create(users, function(error) {
      assert.ifError(error);
      done();
    });
  });

  it('can save users cart', function(done) {
    var PRODUCT_ID = '000000000000000000000001';
    var url = URL_ROOT + '/user/cart';
    superagent.put(url).send({
      data: { cart: [{ product: PRODUCT_ID, quantity: 1 }] }
    }).
    end(function(error, res) {
      assert.ifError(error);
      assert.equal(res.status, status.OK);
      User.findOne({}, function(error, user) {
        assert.ifError(error);
        assert.equal(user.data.cart.length, 1);
        assert.equal(user.data.cart[0].product, PRODUCT_ID);
        assert.equal(user.data.cart[0].quantity, 1);
        done();
      });
    });
  });

  it('can load the users cart', function(done) {
    var PRODUCT_ID = '000000000000000000000001';
    var url = URL_ROOT + '/user';

    var category = { _id: 'Electronics' };

    var product =
      {
        _id: PRODUCT_ID,
        name: 'Product 1',
        category: { _id: 'Electronics', ancestors: ['Electronics'] },
        price: {
          amount: 300,
          currency: 'USD'
        }
      };

    Category.create(category, function(error, doc) {
      assert.ifError(error);
    });

    Product.create(product, function(error, doc) {
      assert.ifError(error);
    });

    User.findOne({}, function(error, user) {
      user.data.cart = [{ product: PRODUCT_ID, quantity: 1 }];
      user.save(function(error) {
        assert.ifError(error);
        superagent.get(url, function(error, res) {

          assert.equal(res.status, 200);
          var result;

          assert.doesNotThrow(function() {
            result = JSON.parse(res.text).user;
          });

          assert.equal(result.data.cart.length, 1);
          assert.equal(result.data.cart[0].product.name, "Product 1");
          assert.equal(result.data.cart[0].quantity, 1);
          assert.equal(result.data.cart.length, 1);
          done();
        });
      })
    });
  });

});

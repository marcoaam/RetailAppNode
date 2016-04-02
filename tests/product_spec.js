var assert = require('assert');
var express = require('express');
var superagent = require('superagent');
var wagner = require('wagner-core');
var mongoose = require('mongoose');
var URL_ROOT = 'http://localhost:3000';

describe('Product API', function() {
  var server;
  var Product;
  var Category;

  before(function() {
    var app = express();

    models = require('../models')(wagner);
    app.use(require('../api')(wagner));

    server = app.listen(3000);

    Product = models.Product;
    Category = models.Category;
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
    done();
  });

  it('can load a product by ID', function(done) {
    var PRODUCT_ID = '000000000000000000000001';
    var product = {
      name: 'Any Product',
      _id: PRODUCT_ID,
      price: {
        amount: 300,
        currency: 'USD'
      }
    };
    Product.create(product, function(error, doc) {
      assert.ifError(error);
      var url = URL_ROOT + '/product/id/000000000000000000000001';
      superagent.get(url, function(error, res) {
        assert.ifError(error);
        var result;

        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });
        assert.ok(result.product);
        assert.equal(result.product.name, 'Any Product');
        done();
      });
    });
  });

  it('can load all products in a category ordered by price', function(done) {
    var products = [
      { name: 'Any Product 1', price: { amount: 300, currency: 'USD'}, category: { _id: 'Phones', ancestors: ['Phones', 'Electronics']} },
      { name: 'Any Product 2', price: { amount: 400, currency: 'GBP'}, category: { _id: 'Laptops', ancestors: ['Laptops', 'Electronics']} },
      { name: 'Any Product 3', price: { amount: 500, currency: 'USD'}, category: { _id: 'Anything', ancestors: ['Anything'] } }
    ];

    var categories = [
      { _id: 'Electronics' },
      { _id: 'Phones', parent: 'Electronics' },
      { _id: 'Laptops', parent: 'Electronics' },
      { _id: 'Anything' }
    ];

    Category.create(categories, function(error, categories) {
      assert.ifError(error);

      Product.create(products, function(error, products) {
        assert.ifError(error);
        var url = URL_ROOT + '/product/category/Electronics?price=1';
        superagent.get(url, function(error, res) {
          assert.ifError(error);
          var result;

          assert.doesNotThrow(function() {
            result = JSON.parse(res.text);
          });

          assert.equal(result.products[0].name, 'Any Product 2');
          assert.equal(result.products[1].name, 'Any Product 1');
          done();
        });
      });
    });
  });
});

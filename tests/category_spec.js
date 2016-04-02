var assert = require('assert');
var express = require('express');
var superagent = require('superagent');
var wagner = require('wagner-core');
var mongoose = require('mongoose');
var URL_ROOT = 'http://localhost:3000';

describe('Category API', function() {
  var server;
  var Category;

  before(function() {
    var app = express();

    models = require('../models')(wagner);
    app.use(require('../api')(wagner));

    server = app.listen(3000);

    Category = models.Category;
  });

  after(function() {
    server.close();
    mongoose.connection.close();
  });

  beforeEach(function(done) {
    Category.remove({}, function(error) {
      assert.ifError(error);
      done();
    });
  });

  it('can load a category by ID', function(done) {
    Category.create({ _id: 'AnyCategory' }, function(error, doc) {
      assert.ifError(error);
      var url = URL_ROOT + '/category/id/AnyCategory';
      superagent.get(url, function(error, res) {
        assert.ifError(error);
        var result;

        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });
        assert.ok(result.category);
        assert.equal(result.category._id, 'AnyCategory');
        done();
      });
    });
  });

  it('can load all categories from a certain parent', function(done) {
    var categories = [
      { _id: 'Electronics' },
      { _id: 'Phones', parent: 'Electronics' },
      { _id: 'Laptops', parent: 'Electronics' },
      { _id: 'Anything' }
    ];

    Category.create(categories, function(error, categories) {
      assert.ifError(error);
      var url = URL_ROOT + '/category/parent/Electronics';
      superagent.get(url, function(error, res) {
        assert.ifError(error);
        var result;

        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });
        assert.equal(result.categories.length, 2);
        assert.equal(result.categories[0]._id, 'Laptops' );
        assert.equal(result.categories[1]._id, 'Phones');
        done();
      });
    });
  });
});

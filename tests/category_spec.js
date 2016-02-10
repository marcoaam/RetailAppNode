var assert = require('assert');
var express = require('express');
var superagent = require('superagent');
var wagner = require('wagner-core');
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
  });

  beforeEach(function(done) {
    Category.remove({}, function(error) {
      assert.ifError(error);
      done();
    });
  });

  it('can load a category by ID', function() {
    Category.create({ _id: 'AnyCategory' }, function(error, doc) {
      assert.ifError(error);
      var url = URL_ROOT + '/category/id/anycategory';

      superagent.get(url, function(error, res) {
        asser.ifError(error);
        var result;

        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });

        assert.ok(result.category);
        asser.equal(resull.category._id, 'AnyCategory');
        done();
      });
    });
  });
});

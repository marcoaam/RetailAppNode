var express = require('express');
var status = require('http-status');

module.exports = function(wagner) {
  var api = express.Router();

  var handleOne = function(property, res, error, result) {
      if(error) {
        return res.
          status(status.INTERNAL_SERVER_ERROR).
          json({ error: error.toString() });
      }

      if(!result) {
        return res.
          status(status.NOT_FOUND).
          json({ error: 'Not found' });
      }

      var json = {};
      json[property] = result;
      res.json(json);
  };

  var handleMany = function(property, res, error, result) {
    if(error) {
      return res.
        status(status.INTERNAL_SERVER_ERROR).
        json({ error: error.toString() });
    }

    var json = {};
    json[property] = result;
    res.json(json);
  };




  api.get('/category/id/:id', wagner.invoke(function(Category) {
    return function(req, res) {
      Category.findOne({ _id: req.params.id }, handleOne.bind(null, 'category', res));
    };
  }));

  api.get('/category/parent/:id', wagner.invoke(function(Category) {
    return function(req, res) {
      Category.
        find({ parent: req.params.id }).
        sort({ _id: 1 }).
        exec(handleMany.bind(null, 'categories', res));
    };
  }));

  api.get('/product/id/:id', wagner.invoke(function(Product) {
    return function(req, res) {
      Product.findOne({ _id: req.params.id }, handleOne.bind(null, 'product', res));
    };
  }));

  return api;
};

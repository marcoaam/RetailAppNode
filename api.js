var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');

module.exports = function(wagner) {
  var api = express.Router();
  api.use(bodyparser.json());

  api.use(bodyparser.json());

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

  api.get('/user', function(req, res) {
    if (!req.user) {
      return res.
        status(status.UNAUTHORIZED).
        json({ error: "Not logged in" });
    }

    req.user.populate(
      { path: 'data.cart.product', model: 'Product' },
      handleOne.bind(null, 'user', res));
  });

  api.put('/user/cart', wagner.invoke(function(User) {
    return function(req, res) {
      try {
        var cart = req.body.data.cart;
      } catch(e) {
        return res.
          status(status.BAD_REQUEST).
          json({ error: 'No cart specified!' });
      }
      req.user.data.cart = cart;
      req.user.save(function(error, user) {
        if (error) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }

        return res.json({ user: user });
      });
    };
  }));

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

  api.get('/product/category/:id', wagner.invoke(function(Product) {
    return function(req, res) {
      var sort = { name: 1 };
      if (req.query.price === '1') {
        sort = { 'internal.approximatePriceUSD': 1 };
      } else if (req.query.price === '-1') {
        sort = { 'internal.approximatePriceUSD': -1 };
      }

      Product.
        find({ 'category.ancestors': req.params.id }).
        sort(sort).
        exec(handleMany.bind(null, 'products', res));
    };
  }));

  api.put('me/cart', wagner.invoke(function(User) {
    return fuction(req, res) {
      try {
        var cart = req.body.data.cart;
      } catch(e) {
        return res.status(status.BAD_REQUEST).
        json({ error: 'No cart specified' });
      }

      req.user.data.cart = cart;
      req.user.save(function(error, user) {
        if(error) {
          return res.status(status.INTERNAL_SERVER_ERROR).
                  json({ error: error.toString() });
        }
        return res.json({ user: user });
      });
    };
  }));

  api.get('me', function(req, res) {
    if(!req.user) {
      return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
    }
    req.user.populate(
      { path: 'data.cart.product', model: 'Product' },
      handleOne.bind(null, 'user', res));
  });
  return api;
};

var express = require('express');
var router = express.Router();
const sequelize = require("sequelize");
const Model = require("../models/");
const transaction = Model.sequelize.models.transaction;
const category = Model.sequelize.models.category;
const Op = sequelize.Op

/* GET home page. */
router.get('/', async (req, res, next) => {
  let result = await transaction.findAll({
    include: [{
      model: category,
      attributes: ['name', 'type']
    }],
    raw: true
  });

  let income = []
  let outcome = []
  result = result.map(r => {
    r['category.type'] === 'out' ? outcome.push(r.nominal) : income.push(r.nominal)
    return r
  })

  let incomeAlltime = income.reduce((a, b) => a + b, 0).toLocaleString("en-US", {currency: "USD"})
  let outcomeAlltime = outcome.reduce((a, b) => a + b, 0).toLocaleString("en-US", {currency: "USD"})
  let saldo = (income.reduce((a, b) => a + b, 0) - outcome.reduce((a, b) => a + b, 0)).toLocaleString("en-US", {currency: "USD"})
  res.render('home', { title: 'Home', incomeAlltime, outcomeAlltime, saldo });
});

module.exports = router;

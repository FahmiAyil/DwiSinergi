var express = require('express');
var router = express.Router();
const moment = require("moment");
const sequelize = require("sequelize");
const Model = require("../models/");
const transaction = Model.sequelize.models.transaction;
const category = Model.sequelize.models.category;
const Op = sequelize.Op

router.get('/', async (req, res, next) => {
  let startDate = req.query.startDate ? moment(req.query.startDate).format("YYYY-MM-DD") : moment(new Date()).startOf('month').format("YYYY-MM-DD")
  let endDate = req.query.endDate ? moment(req.query.endDate).format("YYYY-MM-DD") : moment(new Date()).endOf('month').format("YYYY-MM-DD")

  let result = await transaction.findAll({
    include: [{
      model: category,
      attributes: ['name', 'type']
    }],
    where: {
      [Op.and]: [
        { updatedAt: { [Op.gte]: startDate, [Op.lte]: endDate } },
      ]

    },
    raw: true });

  let income = []
  let outcome = []
  result = result.map(r => {
    r.tipe = r['category.type'] === 'out' ? 'Pengeluaran' : 'Pemasukan'
    r.nominalConverted = r.nominal.toLocaleString("en-US", {
      currency: "USD"
    })
    r.tanggal = moment(r.updatedAt).format('DD-MMM-YYYY')

    r['category.type'] === 'out' ? outcome.push(r.nominal) : income.push(r.nominal)
    return r
  })

  let saldo = income.reduce((a, b) => a + b, 0) - outcome.reduce((a, b) => a + b, 0)
  saldo = saldo.toLocaleString("en-US", {
    currency: "USD"
  })

  res.render('transaction', { title: 'Transaksi', result, saldo, startDate, endDate });
});

router.get('/addtransaction', async (req, res, next) => {
  let result = await category.findAll({ raw: true });
  res.render('form/formTransaction', { title: 'Tambah Transaksi', result });
});

router.post('/savetransaction', async (req, res, next) => {
  console.log('Obtain data ==> ', req.body)
  let { nominal, category_id } = req.body
  let addData = await transaction.create({
    nominal,
    category_id,
  });
  res.redirect('/transactions');
});

router.get('/edittransaction/:id', async (req, res, next) => {
  let result = await transaction.findOne({
    where: {
      id: req.params.id
    },
    raw: true
  });
  let categories = await category.findAll({ raw: true });

  res.render('form/editFormTransaction', { title: 'Edit Transaksi', result, categories });
});

router.put('/edittransaction', async (req, res, next) => {
  console.log('Obtain data to put ==> ', req.body)
  try {
    let { id, nominal, category_id } = req.body
    let editData = await transaction.update({
      nominal,
      category_id,
    },
      {
        where: {
          id
        }
      });
    res.redirect('/transactions');
  } catch (e) {
    console.log('error ====> ', e)
  }
});

router.delete('/deletetransaction/:id', async (req, res, next) => {
  let result = await transaction.destroy({
    where: {
      id: req.params.id
    },
    raw: true
  });
  res.redirect('/transactions');
})

module.exports = router;

var express = require('express');
var router = express.Router();
const sequelize = require("sequelize");
const Model = require("../models/");
const category = Model.sequelize.models.category;

router.get('/', async (req, res, next) => {
  let result = await category.findAll({ raw:true });
  console.log(result)
  result = result.map(r => {
    r.tipe = r.type === 'out' ? 'Pengeluaran' : 'Pemasukan'
    return r
  })
  res.render('category', { title: 'Kategori', result });
});

router.get('/addcategory', async (req, res, next) => {
  res.render('form/formCategory', { title: 'Tambah Kategori' });
});

router.post('/savecategory', async (req, res, next) => {
  console.log('Obtain data ==> ', req.body)
  let {name, type, description} = req.body
  let addData = await category.create({
    name,
    type,
    description
  });
  res.redirect('/category');
});

router.get('/editcategory/:id', async (req, res, next) => {
  let result = await category.findOne({
    where: {
      id: req.params.id
    },
    raw: true });
  res.render('form/editFormCategory', { title: 'Edit Kategori', result });
});

router.put('/editcategory', async (req, res, next) => {
  console.log('Obtain data to put ==> ', req.body)
  try{
    let { id, name, type, description } = req.body
    let editData = await category.update({
      name: name,
      type: type,
      description: description
    },
      {
        where: {
          id
        }
      });
    res.redirect('/category');
  }catch(e){
    console.log('error ====> ', e)
  }
});

router.delete('/deletecategory/:id', async (req, res, next) => {
  let result = await category.destroy({
    where: {
      id: req.params.id
    },
    raw: true
  });
  res.redirect('/category');
})

module.exports = router;

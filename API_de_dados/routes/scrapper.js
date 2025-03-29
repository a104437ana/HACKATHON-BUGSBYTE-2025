var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/* GET home page. */
router.get('/continente', async function(req, res, next) {
  step = 36
//  total = 5422
  total = 100
  start = 0
  let url = `https://www.continente.pt/mercearia/?start${start}`;
  let produtos = []

  while (start < total) {
    url = `https://www.continente.pt/mercearia/?start${start}`;
    await axios.get(url)
      .then(resp => {
        const $ = cheerio.load(resp.data);
        $('.product').each((index, element) => {
          const productStr = $(element).find('div').attr('data-product-tile-impression');

          if (productStr) {
            try {
              const product = JSON.parse(productStr);
              produtos.push(product);
            }
            catch (error) {
//              console.log(`Erro ao fazer parse do objeto: ${productStr}`);
            }
          }
        });
      })
      .catch(error => {
        console.log(error)
        res.render('error', {error: error})
      })
    start += step;
  }
//  res.render('index', { title: 'Express', produtos:  produtos});
  res.status(200).jsonp(produtos)
});

// GET PRODUCTS
router.get('/produtos', function(req, res, next) {
  axios.get(`http://localhost:3000/products_info`)
  .then(resp => {
    res.status(200).jsonp(resp.data)
  })
  .catch(error => {
    console.log(error)
    res.render('error', {error: error})
  })
});

// GET PRODUCT
router.get('/produtos/:id', function(req, res, next) {
  axios.get(`http://localhost:3000/products_info?sku=${req.params.id}`)
  .then(resp => {
    res.status(200).jsonp(resp.data)
  })
  .catch(error => {
    console.log(error)
    res.render('error', {error: error})
  })
});

module.exports = router;

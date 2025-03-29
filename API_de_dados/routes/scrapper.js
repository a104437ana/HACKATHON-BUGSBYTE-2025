var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/* GET home page. */
router.get('/', async function(req, res, next) {
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
          const product = $(element).find('div').attr('data-product-tile-impression');
          produtos.push(product);
          console.log(product);
        });
      })
      .catch(error => {
        console.log(error)
        res.render('error', {error: error})
      })
    start += step;
  }
  res.render('index', { title: 'Express', produtos:  produtos});
});

module.exports = router;

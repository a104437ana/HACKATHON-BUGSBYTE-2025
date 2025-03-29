var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');


/* GET home page. */
router.get('/continente', async function(req, res, next) {
  let url = "https://www.continente.pt/sitemap-custom_sitemap_1-product.xml";
  let lista_urls = [];
  await axios.get(url)
    .then(response => {
      const parser = new xml2js.Parser();
      parser.parseString(response.data, (err, result) => {
        if (err) {
          console.error("Erro ao parsear o XML:", err);
          return;
        }
        // Acessando as URLs dentro da estrutura XML convertida
        const urls = result.urlset.url;
        urls.forEach(item => {
          if (item.loc && item.loc[0]) {
            lista_urls.push(item.loc[0]);
          }
        });
      });
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
    });
  
       let produtos = []
       let id = 0

       for (let url of lista_urls) {
        await axios.get(url)
          .then(resp => {
            const $ = cheerio.load(resp.data);
            const productId = url.match(/(\d+).html/)[1];
            const productName = $('.pwc-h3.col-h3.product-name.pwc-font--primary-extrabold.mb-0').text().trimStart().replace(/^\s/, '').trimEnd().replace(/\s$/, '');
            const productPrice = $('.ct-price-formatted').text().trimStart().replace(/^\s/, '').trimEnd().replace(/\s$/, '').replace(/€/, '').replace(/,/, '.');
            if (productName && productPrice) {
              try {
                const product_obj = {"id": productId, "product_dsc": productName, "product_price": productPrice}
                const productStr = JSON.stringify(product_obj);
                const product = JSON.parse(productStr)
                produtos.push(product);
                console.log(product)
                id += 1
              }
              catch (error) {
              }
            }
          })
          .catch(error => {
            console.log(error)
            res.render('error', {error: error})
          })
       }
     for (let produto of produtos) {
         let id = parseInt(produto.id)
           try {
             const resp = await axios.get(`http://localhost:3000/products_info/${id}`)
              let prod = resp.data
              if (prod) {
                prod["product_price"] = produto.price
                console.log(prod)
                await axios.put(`http://localhost:3000/products_info/${id}`, prod)
              }
            }
            catch (error) {
            }
        }
//  res.render('index', { title: 'Express', produtos:  produtos});
//  res.status(200).jsonp(produtos)
  res.status(200).send("Precos atualizados")
});

router.get('/continente/:id', async function(req, res, next) {
  start = req.params.id
  let url = `https://www.continente.pt/mercearia/?start${start}`;
  let produtos = []

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
          }
        }
      });
    })
    .catch(error => {
      console.log(error)
      res.render('error', {error: error})
    })
  for (let produto of produtos) {
      let id = parseInt(produto.id)
      try {
        const resp = await axios.get(`http://localhost:3000/products_info/${id}`)
        let prod = resp.data
        if (prod) {
          prod["product_price"] = produto.price
          console.log(id)
          await axios.put(`http://localhost:3000/products_info/${id}`, prod)
        }
      }
      catch (error) {
      }
  }
  res.status(200).send("")
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
  axios.get(`http://localhost:3000/products_info/${req.params.id}`)
  .then(resp => {
    res.status(200).jsonp(resp.data)
  })
  .catch(error => {
    console.log(error)
    res.render('error', {error: error})
  })
});

// GET PRODUCTS nome e id
router.get('/produtos_info', function(req, res, next) {
  axios.get(`http://localhost:3000/products_info`)
  .then(resp => {
    const filteredProducts = resp.data.map(product => {
      return {
        id: product.id,
        product_dsc: product.product_dsc
      }
    })
    res.status(200).jsonp(filteredProducts)
  })
  .catch(error => {
    console.log(error)
    res.status(500).render('error', {error: error})
  })
});

// GET PRODUCT nome e id
router.get('/produtos_info/:id', function(req, res, next) {
  axios.get(`http://localhost:3000/products_info/${req.params.id}`)
  .then(resp => {
    if (resp.data.length == 1) {
      const product = resp.data[0]
      const filteredProduct = {
        id: product.id,
        product_dsc: product.product_dsc
      }
      res.status(200).jsonp(filteredProduct)
    }
    else {
      console.log("Produto não encontrado")
      res.status(404).render('error', {error: error})
    }
  })
  .catch(error => {
    console.log(error)
    res.status(500).render('error', {error: error})
  })
});

router.get('/minipreco/mercearia', async function(req, res, next) {
  step = 1
//  total = 183
  total = 1
  start = 0
  let url = `https://www.minipreco.pt/produtos/mercearia/c/WEB.003.000.00000?q=%3Arelevance&page=${start}&disp=2000`;
  let produtos = []
  let id = 0

  const resp = await axios.get(`http://localhost:3000/products_info`)
  const produtosContinente_list = resp.data.map(product => product.product_dsc)
  let produtosContinente_map = {}
  resp.data.map(product => {
    produtosContinente_map[product.product_dsc] = product.id
  })

  while (start < total) {
    url = `https://www.minipreco.pt/produtos/mercearia/c/WEB.003.000.00000?q=%3Arelevance&page=${start}&disp=2000`;
    try {
      const resp = await axios.get(url);
      const $ = cheerio.load(resp.data);
      const productPromises = $('.product-list__item').map(async (index, element) => {
        const productName = $(element).find('.details').text().trimStart().replace(/^\s/, '');
        const productPrice = $(element).find('.price').text().trimStart().replace(/^\s/, '');

        if (productName && productPrice && (productName in produtosContinente_list)) {
          try {
            const product_obj = {"id": id, "product_dsc": productName, "product_price": productPrice}
            const productStr = JSON.stringify(product_obj);
            const product = JSON.parse(productStr)
            await axios.post(`https://localhost:3000/minipreco`, product)
            produtos.push(product);
            id += 1
          }
          catch (error) {
          }
        }
      }).get()
      await Promise.all(productPromises);
    }
    catch (error) {
      console.log(error)
      res.render('error', {error: error})
    }
    start += step;
  }/*
  produtosMinipreco = {
    "minipreco": produtos
  }
  await axios.post(`http://localhost:3000/competicao`, produtosMinipreco)
    .then(resp => {
      console.log("Post realizado com sucesso")
      res.status(201).send("Post realizado com sucesso")
    })
    .catch(error => {
      console.log(error)
      res.render('error', {error: error})
    })*/
});

router.get('/minipreco/:id', async function(req, res, next) {
});

router.get('/minipreco/continente', async function(req, res, next) {
  axios.get(`http://localhost:3000/products_info`)
  .then(resp => {
    res.status(200).jsonp(resp.data[0])
  })
  .catch(error => {
    console.log(error)
    res.render('error', {error: error})
  })
});

module.exports = router;

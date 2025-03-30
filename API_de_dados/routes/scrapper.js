var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const natural = require('natural');


// GET precos continente
router.get('/continente', async function(req, res, next) {
  let url = "https://www.continente.pt/sitemap-custom_sitemap_1-product.xml";
  let lista_urls = [];
  let ids = [];

  axios.get('http://localhost:3000/products_info')
    .then(response => {
      ids = response.data.map(product => String(product.id).trim());
    })
    .catch(error => {
      console.error('Erro ao buscar os dados:', error);
    });

  await axios.get(url)
    .then(response => {
      const parser = new xml2js.Parser();
      parser.parseString(response.data, (err, result) => {
        if (err) {
          console.error("Erro ao parsear o XML:", err);
          return;
        }
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

  let produtos = [];
  let i = 0;
  for (let url of lista_urls) {
    console.log(`${i}/${lista_urls.length}`);
    i += 1;

    const idMatch = url.match(/(\d+).html/);
    let productId = 0;
    if (idMatch) {
      productId =  String(idMatch[1]).trim();
    }

    if (productId && ids.includes(productId)) {
      await axios.get(url)
        .then(resp => {
          const $ = cheerio.load(resp.data);
          const productName = $('.pwc-h3.col-h3.product-name.pwc-font--primary-extrabold.mb-0')
            .text().trimStart().replace(/^\s/, '').trimEnd().replace(/\s$/, '');
          const productPrice = $('.ct-price-formatted').text().trimStart().replace(/^\s/, '')
            .trimEnd().replace(/\s$/, '').replace(/€/, '').replace(/,/, '.');

          if (productName && productPrice) {
            try {
              const product_obj = { "id": productId, "product_dsc": productName, "product_price": productPrice };
              const productStr = JSON.stringify(product_obj);
              const product = JSON.parse(productStr);
              produtos.push(product);
            }
            catch (error) {
              console.error("Erro ao processar o produto:", error);
            }
          }
        })
        .catch(error => {
          console.error("Erro ao acessar a URL do produto:", error);
        });
    } else {
    }
  }

  for (let produto of produtos) {
    let id = parseInt(produto.id);
    try {
      const resp = await axios.get(`http://localhost:3000/products_info/${id}`);
      let prod = resp.data;
      if (prod) {
        prod["product_price"] = produto.product_price;  // Corrigido o nome da variável
        await axios.put(`http://localhost:3000/products_info/${id}`, prod);
      }
    }
    catch (error) {
      console.error("Erro ao atualizar o produto:", error);
    }
  }

  res.status(200).send("Preços atualizados");
})

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

// GET precos mini preco
router.get('/minipreco/mercearia', async function(req, res, next) {
  step = 1
  total_category = {0:183, 1:6, 3:183, 5:14, 6:10, 7:26, 8:8, 9:35, 10:3, 11:18, 12:2}
  start = 0
  let id = 0

  const resp = await axios.get(`http://localhost:3000/products_info`)
  const produtosContinente_list = resp.data.map(product => product.product_dsc)
  let produtosContinente_map = {}
  resp.data.map(product => {
    produtosContinente_map[product.product_dsc] = product.id
  })

  for (let [category, total] of Object.entries(total_category)) {
    console.log("Categoria: " + category)
    console.log("Total: " + total)
    while (start < total) {
      url = `https://www.minipreco.pt/produtos/mercearia/c/WEB.0${String(category).padStart(2, '0')}.000.00000?q=%3Arelevance&page=${start}&disp=2000`;
      console.log(url)
      try {
        const resp = await axios.get(url);
        const $ = cheerio.load(resp.data);
        const productPromises = $('.product-list__item').map(async (index, element) => {
          const productName = $(element).find('.details').text().trimStart().replace(/^\s/, '');
          const productPrice = $(element).find('.price').text().trimStart().replace(/^\s/, '').replace(/€/, '').trimEnd().replace(/\s$/, '');

          if (productName && productPrice) {
            let bestMatch = null
            let highestScore = 0
            produtosContinente_list.forEach(item => {
              let itemContinente = item
              let similarity = natural.JaroWinklerDistance(productName.toUpperCase(), item.toUpperCase())
              if (similarity > highestScore) {
                highestScore = similarity
                bestMatch = itemContinente
              }
            })
            if (highestScore > 0.88) {
              try {
                let id_continente = produtosContinente_map[bestMatch]
                const respContinente = await axios.get(`http://localhost:3000/products_info/${id_continente}`)
                let product = respContinente.data
                product["preco_minipreco"] = productPrice
                await axios.put(`http://localhost:3000/products_info/${id_continente}`, product)
                console.log(product)
              }
              catch (error) {
                console.log("Erro: " + productName + " " + highestScore)
              }
            }
          }
          id += 1
        }).get()
        await Promise.all(productPromises);
      }
      catch (error) {
        console.log(error)
        res.render('error', {error: error})
      }
      start += step;
    }
    start = 0
  }
   res.status(200).send("")
});


module.exports = router;

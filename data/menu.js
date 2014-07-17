module.exports = {
  "asi-trabajamos": {
    "caption": "Así trabajamos"
    ,"desc": "Galería de imágenes sobre el proceso productivo"
    ,"data": require('./galerias')
  },
  "productos": {
    "caption": "Productos"
    ,"desc": "Catálogo de productos"
    ,"data": require('./productos')
  },
  "empresa": {
    "caption": "Empresa"
    ,"desc": "La empresa"
  },
  "actualidad": {
    "caption": "Actualidad"
    ,"desc": "Menciones en la prensa, eventos a los que asistimos, nuevos productos..."
    ,"scripts": [
      "/js/actualidad.js"
    ]
  },
  "donde-comprar": {
    "caption": "Dónde comprar"
    ,"desc": "Tiendas, restaurantes y distribuidores que ofertan nuestros productos"
    ,"data": require('./lugares')
  },
  "contacto": {
    "caption": "Contacto"
    ,"desc": "Contáctanos!"
  }
};

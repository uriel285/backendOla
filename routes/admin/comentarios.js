var express = require('express');
var router = express.Router();
var comentariosModel = require('../../models/Models');
var util = require('util');
var cloudinary = require('cloudinary').v2;

const fs = require('fs');

const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

router.get('/', async function (req, res, next) {
  var comentarios = await comentariosModel.getComentarios();

  comentarios = comentarios.map(comentario =>{
    if (comentario.img_id){
      const imagen = cloudinary.image(comentario.img_id, {
        width: 100,
        height: 100,
        crop: 'fill'
      });
      return {
        ...comentario,
        imagen
      }
    }
    else {
      return{
        ...comentario,
        imagen: ''
      }
    }
  })

  res.render('admin/comentarios', {
    layout: 'admin/layout',
    usuario: req.session.nombre,
    comentarios
  });
});
router.get('/agregar', (req, res, next) =>{
  res.render('admin/agregar', {
    layout: 'admin/layout'
  });
});

router.post('/agregar', async (req, res, next) =>{
  try{
    var img_id = '';
    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      img_id = (await uploader(imagen.tempFilePath)).public_id;
    }
    if(req.body.usuario != '' && req.body.puntuacion != '' && req.body.comentario != ''){
      await comentariosModel.insertComentarios({
      ...req.body,
      img_id
    });
    res.redirect('/comentarios')
    }
    else{
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true, message: 'Todos los campos son requeridos'
      });
    }
  }
  catch(error){
    console.log(error)
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true, message: 'No se cargo el comentarios'
  })
  }
});

router.get('/eliminar/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const comentario = await comentariosModel.getComentariosById(id);

    if (comentario && comentario.img_id) {
      await destroy(comentario.img_id);
    }

    await comentariosModel.deleteComentariosById(id);
    res.redirect('/comentarios');
  } catch (error) {
    console.log(error);
    res.redirect('/comentarios');
  }
});


router.get('/modificar/:id', async (req, res, next) =>{
  let id = req.params.id;
  let comentarios = await comentariosModel.getComentariosById(id);
  res.render('admin/modificar', {
    layout:'admin/layout',
    comentarios
  });
});

router.post('/modificar', async(req, res, next) =>{
  try{

    let img_id = req.body.img_original;
    let borrar_img_vieja = false;
    if (req.body.img_delete === '1'){
      img_id = null;
      borrar_img_vieja = true;
    }
    else{
      if(req.files && Object.keys(req.files)>0){
        imagen = req.files.img;
        img_id = (await uploader(imagen.tempFilePath)).public_id;
        borrar_img_vieja = true;
      }
    }
    if(borrar_img_vieja && req.body.img_original){
      await (destroy(req.body.img_original));
    }

    let obj = {
      usuario: req.body.usuario,
      puntuacion: req.body.puntuacion,
      comentario: req.body.comentario
    }
    await comentariosModel.modificarComentariosById(obj, req.body.id);
    res.redirect('/comentarios');
  }
  catch(error){
    console.log(error)
    res.render('admin/modificar',{
      layout: 'admin/layout',
      error: true, message: 'No se modifico el comentarios'
    })
  }
});

module.exports = router;

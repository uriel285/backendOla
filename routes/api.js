var express = require('express');
var router = express.Router();
var comentariosModel = require('../models/Models');
var cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');


router.get('/comentarios', async function (req, res, next) {
    var comentarios = await comentariosModel.getComentarios();

    comentarios = comentarios.map(comentarios => {
        if (comentarios.img_id) {
            const imagen = cloudinary.url(comentarios.img_id, {
                width: 80,
                height: 80,
                crop: 'fill'
            });
            return {
                ...comentarios,
                imagen
            }
        }
        else {
            return {
                ...comentarios,
                imagen: ''
            }
        }
    })
    res.json(comentarios);
})

router.post('/contacto', async (req, res) =>{
    const mail = {
        to: 'contactoherrerauriel@gmail.com',
        subject: 'Contacto web',
        html: `${req.body.nombre} se contacto a través de la web y quiere más información a este correo: ${req.body.email} <br> Además, hizo el siguiente comentario: ${req.body.mensaje} <br> Su tel es: ${req.body.telefono}`
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    await transport.sendMail(mail)

    res.status(201).json({
        error: false,
        message: 'Mensaje enviado'
    });
});

module.exports = router;
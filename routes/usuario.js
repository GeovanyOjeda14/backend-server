var express = require('express');
var bcrypt = require('bcryptjs');
var middlewareAut = require('../middleware/authentication');
var app = express();
var Usuario = require('../models/usuario');

// ======================================
// Obtener todos los usuarios
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img rol')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: 'false',
                    mensaje: 'Error cargando usuarios.',
                    errors: err
                });
            }

            Usuario.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: 'true',
                    usuarios: usuarios,
                    total: conteo
                });
            });



        });
});


// ======================================
// Actualizar usuario
// ======================================

app.put('/:id', middlewareAut.verificaToken, (req, res) => {
    // console.log('reqqqqqqq', req);
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: 'false',
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuario) {

            return res.status(400).json({
                ok: 'false',
                mensaje: 'El usuario con el : ' + id + ' ,no existe.',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: 'false',
                    mensaje: 'Error al actualizar usuario',
                });
            }

            usuarioGuardado.password = '';

            res.status(200).json({
                ok: 'true',
                usuario: usuarioGuardado
            });

        });
    });
});

// ======================================
// Crear un nuevo usuario
// ======================================

app.post('/', middlewareAut.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: 'false',
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }

        res.status(201).json({
            ok: 'true',
            usuarios: usuarioGuardado,
            userToken: req.usuario
        });

    });
});


// ======================================
// Borrar usuario por id
// ======================================

app.delete(('/:id'), middlewareAut.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove((id), (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: 'false',
                mensaje: 'Error al borrar usuario',
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: 'false',
                mensaje: 'No existe un usuario con el id  : ' + id,
                errors: { message: 'No existe el usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: 'true',
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;
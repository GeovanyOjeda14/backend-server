var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

// Modelos
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: 'false',
            mensaje: 'Tipo de coleccion no es valido.',
            errors: { message: 'Las colecciones validas son ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: 'false',
            mensaje: 'No se cargo ninguna imagen.',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    // Para oobtener el valor de la ultima posicion despues de hacer el split()
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extenciones de archivo aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: 'false',
            mensaje: 'Extension no valida.',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path especifico
    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: 'false',
                mensaje: 'Error al mover archivo',
                errors: { message: err }
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {


    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {


            if (!usuario) {
                return res.status(400).json({
                    ok: 'true',
                    mensaje: 'El usuario no existe.',
                    errors: { message: 'EL usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = '';
                return res.status(200).json({
                    ok: 'true',
                    mensaje: 'Imagen de usuario actualizada.',
                    usuarioActualizado: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: 'true',
                    mensaje: 'El medico no existe.',
                    errors: { message: 'EL medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = '';
                return res.status(200).json({
                    ok: 'true',
                    mensaje: 'Imagen de usuario actualizada.',
                    medicoActualizado: medicoActualizado
                });
            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: 'true',
                    mensaje: 'El hospital no existe.',
                    errors: { message: 'EL hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: 'true',
                    mensaje: 'Imagen de hospital actualizada.',
                    hospitalActualizado: hospitalActualizado
                });
            });

        });
    }
}

module.exports = app;
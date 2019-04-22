const express = require('express');
const router  = express.Router();
const ensureLogin = require('connect-ensure-login') /* <<<---- limitar ruta a que alguien haya iniciado sesión y se espera que se puedan ver rutas privadas 
(como face que hay cosas que no puedes hacer sin haber iniciado sesión) para eso es connect-ensure-login 
VALIDA QUE EXISTA UNA SESIÓN
*/

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('private-page', //ejecutar middleware para verificar si hay usuario en sesión
ensureLogin.ensureLoggedIn(),
(req, res) => { //si hay usuario sesión puede
res.render('private', {user: req.user}) 
})

module.exports = router;

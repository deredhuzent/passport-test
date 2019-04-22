const {Router} = require('express');
const bcrypt = require('bcrypt')
const authRouter = Router()
const passport = require('passport') //sucede después de mandarlo a llamar así que lo traemos de la librería
const User = require('../models/User')

authRouter.get('/signup', (req, res) => {
  res.render('auth/signup')
})

authRouter.post('signup', async (req,res) => {
  const {username, password} = req.body
  
  if(username === '' || password === '') {
    res.render('auth/signup', {
      message: 'Indicate username and password'
    })
  }
  
  const user = await User.findOne({ username });
  
  if(user !== null){
    return res.render('auth/signup', {
      message: 'The username already exist'
    })
    
  }
  
  //AQUÍ ESTAMOS SALIENDO DEL FLUJO NORMAL DE JS
  
  //generamos el salt que ayuda a hashear la contraseña 10 veces
  const salt = bcrypt.genSaltSync(10)  //cuántas veces va a generar el cifrado
  //toma el password y lo hasheamos en función al salt
  const hashPass= bcrypt.hashSync(password, salt) //general el cifrado en función al salt
  
  const newUser = new User({
    username,
    password: hashPass // así se guarda la representación hasheada de la contraseña
    // contraseña --->>> contra123 --->>> bajvfhsgbeabier <<<---- así se representa de forma hasheada
  })
  
  console.log({username, password: hashPash}) // para ver cómo aparece
  
  try {
    //esperar a que se guarde para continuar con el proceso
    await newUser.save() //me devuelve el usuario guardado, pero no se entrega como tal, solo espera a que se guarde
    res.redirect('/')
  } catch (error){ //si llega a haber un error:
    res.render("auth/signup", { message: "Something went wrong" }); //código fuera de nuestro control de js, para no dejar propenso a errores
  }
})

//manejo del login
authRouter.get('/login', (req, res) => {
  res.render("auth/login", { "message": req.flash("error") }); //mandamos el error de flash para decirle al usuario qué pedo
})

/* ************* HAY 2 CLASES DIF DE MIDDLEWARE:
1) middleware general-->> funciona siempre que hago request
2) middleware específico -->> funciona después de una ruta en específco 
*/
//utilizar password como middleware y estrategia local
authRouter.post('/login', passport.authenticate('local', {
  successRedirect:'/',  //si todo pasa correctamente, mando a la raíz
  failureRedirect: '/login',  //pasa el mismo forulario, pero si sucede un error manda mensaje
  failureFlash: true, // 
  passReqToCallback: true // para continuar mandando el req en la cadenita de middleware hasta el response, y el next viaja aquí
})) 

authRouter.get("/logout", (req, res) => { //saca de sesión y redirije al login
  req.logout();
  res.redirect("/login");
});

module.exports = authRouter
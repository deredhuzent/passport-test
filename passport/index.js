const passport = require('passport');

//usamos .Strategy en el require si traemos una estrategia del passport
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const User = require('../models/User');


//cb callback que se ejecuta cuando hay inicio de sesión, o sea, 
//cuando mandan algo en el post del login y hace algo en función a él
passport.serializeUser((user, cb) => {
cb(null, user._id) //ejecuta un callback en el inicio de sesión 
//para poder definir la sesión
})


passport.deserializeUser((id, cb) => { //serializar significa guardar la sesión ir a la base de datos y poner el objeto del usuario 
  User.findById(id, (err, user) => { //busca
    if (err) { return cb(err); } 
    cb(null, user);// lo pone disponible
  });
});


/*

1) SERIALIZE pone disponible en la sesión
2) Una vez gestionado DESERIALIZED va a la base de datos busca y serializa
3) pone disponible en la requisición --->>> (req.user)

STACKOVERFLOW explanation:  (https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize)
---------------------------------------------------------------------------------------
1.- Where does user.id go after passport.serializeUser has been called?
The user id (you provide as the second argument of the done function) 
is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

serializeUser determines which data of the user object should be stored in the session. 
The result of the serializeUser method is attached to the session as req.session.passport.user = {}. 
Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}

2.- We are calling passport.deserializeUser right after it where does it fit in the workflow?
The first argument of deserializeUser corresponds to the key of the user object that was given to the done function 
(see 1.). So your whole object is retrieved with help of that key. That key here is the user id 
(key can be any key of the user object i.e. name,email etc). 
In deserializeUser that key is matched with the in memory array / database or any data resource.

The fetched object is attached to the request object as req.user
---------------------------------------------------------------------------------------------

passport.serializeUser(function(user, done) { // done es igual a cb
    done(null, user.id);
});              │
                 │ 
                 │
                 └─────────────────┬──→ saved to session
                                   │    req.session.passport.user = {id: '..'}
                                   │
                                   ↓           
passport.deserializeUser(function(id, done) {
                   ┌───────────────┘
                   │
                   ↓ 
    User.findById(id, function(err, user) { //va a la base de datos gracias al ID
        done(err, user);
    });            └──────────────→ user object attaches to the request as req.user   
});
*/



//next --->>> continúa el flujo
passport.use(new  LocalStrategy( //usar estrategia local middleware de passport para manejar la lógica
  async (username, password, next) => { //callback con usuario y psswrd
    try{
      const user = await User.findOne({username}) //verifica buscando un usuario, si no exste pasa el next que no se enfoca en arreglar el error, sino en continuar con el flujo
      if(!user) return next(null, false, {  //genera un callback y dice que el usuario está incorrecto
        message: "Incorrect username" 
      });
      if(!bcrypt.compareSync(password, user.password)) return next (null, false, { //compara la contraseña en bcrypt
        message: 'Incorrect password'
      })
      return next (null, user) //si no hay ningún error

    }catch (error) { //si hay algún error de algún tipo diferente lanza el error
      return next(error)
    }
}))

module.exports = passport //trae la librería y devuélvela
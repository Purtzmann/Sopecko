const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require("express-rate-limit");
const xss = require('xss-clean');
const cors = require("cors");
let helmet = require('helmet');
let ExpressSession = require('express-session');


const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');

mongoose.connect('mongodb+srv://purtzmann:Maisoncarotte@dataapi.6pu2l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
});

//app.use(bodyParser.json());
app.use(express.json());

app.use(helmet());
app.use('/api',limiter);
app.use(xss());

app.set('trust proxy', 1) 
app.use( ExpressSession({
   secret : 's3Cur3',
   name : 'sessionId',
  })
);


app.use('/images', express.static(path.join(__dirname,'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);


module.exports = app;

//https://expressjs.com/fr/advanced/best-practice-security.html
//https://blog.risingstack.com/node-js-security-checklist/
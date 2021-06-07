const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config');




router.post('/', auth, multer, saucesCtrl.creationSauce)
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.get('/', auth, saucesCtrl.affichesSauces);
router.get('/:id', auth, saucesCtrl.afficheSauce);
router.delete('/:id', auth, saucesCtrl.supprSauce);
router.post('/:id/like', auth, saucesCtrl.likeDislike)


module.exports = router;
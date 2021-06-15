const connection = require('../database/connection');
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const WalletController = require('../controllers/WalletController');
const RegisterController = require('../controllers/RegisterController');

router
// Rotas usuário.
    .post('/api/createUser', UserController.newUser)
    .put('/api/updateUser', UserController.UpdateUser)
    .post('/api/login', UserController.login)
    .get('/api/getInfos', UserController.getInfos)
  
// Rotas carteiras.
    .post('/api/createWallet', WalletController.CreateWallet)
    .get('/api/getWallets',WalletController.getWallets)
    .put('/api/UpdateWallet', WalletController.UpdateWallet)
    .delete('/api/deleteWallet', WalletController.deleteWallet)

// Rotas Register
    .post('/api/createRegister',RegisterController.CreateRegister)
    .put('/api/updateRegister',RegisterController.updateRegister)
    .get('/api/getAllRegisters', RegisterController.GetAllRegisters)


module.exports = router;
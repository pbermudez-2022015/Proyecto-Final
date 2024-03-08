import express from 'express'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { searchCli, deleteAdmin, registerClient, registerAd, test, login, updateClient, deleteU, search, getUser, createAdmin, updateAdmin } from './user.controller.js';

const api = express.Router();

//rutas Publicas
api.post('/admin', createAdmin)
api.post('/registerClient', registerClient)
api.post('/login', login)
api.post('/searchCli', searchCli)


//Rutas Privadas
api.put('/updateClient', [validateJwt], updateClient)
api.post('/registerAd', [validateJwt], registerAd)
api.put('/updateAdmin/:id', [validateJwt], updateAdmin)
api.post('/search', [validateJwt], search)
api.get('/getUser/:id', [validateJwt], getUser)
api.post('/delete/:id', [validateJwt], deleteU)
api.delete('/deleteAdmin/:id', [validateJwt], deleteAdmin)
api.get('/test', [validateJwt], test)
export default api

'use strict'

import { Router } from 'express'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { save, test, get, getProduct, update, deleteP, search, searchClient } from './product.controller.js'

const api = Router()

api.get('/test', test)
//rutas publicas
api.post('/searchClient', searchClient)
//rutas privadas
api.post('/save', [validateJwt], save)
api.get('/get', [validateJwt], get)
api.get('/getProduct/:id', [validateJwt], getProduct)
api.put('/update/:id', [validateJwt], update)
api.delete('/delete/:id', [validateJwt], deleteP)
api.post('/search', [validateJwt], search)


export default api
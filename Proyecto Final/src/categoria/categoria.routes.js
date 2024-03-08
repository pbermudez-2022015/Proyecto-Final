'use strict'

import { Router } from 'express'
import { defaultCategoria, save, test, get, getCategoria, update, deleteC, search } from './categoria.controller.js'
import { validateJwt } from '../middlewares/validate-jwt.js'
const api = Router()

//rutas privadas
api.get('/test', [validateJwt], test)
api.post('/save', [validateJwt], save)
api.get('/get', [validateJwt], get)
api.get('/getCategoria/:id', [validateJwt], getCategoria)
api.put('/update/:id', [validateJwt], update)
api.delete('/delete/:id', [validateJwt], deleteC)
api.post('/search', [validateJwt], search)
api.post('/defaultCategoria', [validateJwt], defaultCategoria)

export default api
'use strict'

import { Router } from 'express'
import { save, test, get, getProduct, update, deleteP, search } from './product.controller.js'

const api = Router()

api.get('/test', test)
api.post('/save', save)
api.get('/get', get)
api.get('/getProduct/:id', getProduct)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteP)
api.post('/search', search)

export default api
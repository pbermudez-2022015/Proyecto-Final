'use strict'

import { Router } from 'express'
import { save, test, get, getCategoria, update, deleteC, search } from './categoria.controller.js'

const api = Router()

api.get('/test', test)
api.post('/save', save)
api.get('/get', get)
api.get('/getCategoria/:id', getCategoria)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteC)
api.post('/search', search)

export default api
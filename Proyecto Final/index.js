import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"

import { createDefaultAdmin } from "./src/user/user.controller.js"
import { defaultCategoria } from "./src/categoria/categoria.controller.js"

initServer()
connect()
createDefaultAdmin()
defaultCategoria()


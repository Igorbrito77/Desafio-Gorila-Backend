
const express = require('express');
const app = express();
const cors = require('cors');

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

app.use(cors());

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

require('./endpoints')(app)


app.listen(3000);


module.exports = app;

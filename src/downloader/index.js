require('dotenv').config()

const jobDownloadATC = require('./job-download-atc')
const jobMover = require('./job-mover')
const jobConverter = require('./job-converter')

jobConverter.start()
jobMover.start()
jobDownloadATC.start()

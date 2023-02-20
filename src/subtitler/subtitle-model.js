const mongoose = require('mongoose')

const schemaInner = mongoose.Schema({ 
    source: { type: String },
    language: { type: String },
    value:  { type: String }
})

const schema = mongoose.Schema({
    anime: { type: String },
    episode: { type: String },
    file: { type: String },
    subtitles: [{ type: schemaInner }]
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('subtitles', schema)
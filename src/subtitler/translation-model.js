const mongoose = require('mongoose')

const schema = mongoose.Schema({
    original: { type: String },
    translated:  { type: String }, 
    options: [{ type: String }],
    sugestions: [{ type: String }],
    ratings: [{ type: String }],
    verified: { type: Boolean },
    approved: { type: Boolean }
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('translations', schema)
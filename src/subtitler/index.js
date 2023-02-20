const fs = require('fs')
const { translate } = require('free-translate')

const SubtitleModel = require('./subtitle-model')
const TranslationModel = require('./translation-model')

const findOrCreate = async (anime, episode, file, language = 'English', source, fileContent) => {
    const subtitles = await SubtitleModel.findOne({ anime, episode})

    if (subtitles) return subtitles.filter(s => s.language == language)

    return new SubtitleModel({ 
        anime, 
        episode, 
        file, 
        subtitles: [{             
            source,
            language,
            value: fileContent,
        }]
    })

}

const process = async (anime, episode, path, file, language, source) => {

    const fileContent = await fs.readFileSync(path + file, { encoding: 'utf8' })
    const subtitle = await findOrCreate(anime, episode, file, language, source, fileContent)

    // if (subtitle) return console.log("Episode already translated!")
    
    const lines = fileContent.split('\r\n');
    const dialoguesLine = lines.filter(s => s.startsWith('Dialogue'))
    const dialogues = dialoguesLine.map(s => {
        return {
            original: s,
            dialogue: s.split(',').slice(9).join(',')
        }        
    })

    const dialoguesTranslated = []


    const chunkSize = 50;
    let txtR = ""
    let txtT = ""
    
    for (let i = 0; i < dialogues.length; i += chunkSize) {
        const chunk = dialogues.slice(i, i + chunkSize);
        
        const toT = chunk.map(d => d.dialogue.replace('\\\N', ' ')).join('\n{\\}')
        const teste = await translate(toT, { from: 'en', to: 'pt-br' })

        console.log(chunk.length)
        console.log(teste.split('{\\}').length)

        txtR += "\n" + toT
        txtT += "\n" + teste.split('{\\}').join('\n')
    }

    const toT = dialogues.map(d => d.dialogue.replace('\\\N', ' ')).join('\n{\\}')
    const teste = await translate(toT, { from: 'en', to: 'pt-br' })

    console.log(dialogues.length)
    console.log(teste.split('{\\}').length)
    
    // console.log(toT)
    // console.log(teste.split('{\\}').join('\n'))

    for (let i = 0; i < dialogues.length; i++) {
        let dialogue = dialogues[i].dialogue;
        let dialogueOriginal = dialogues[i].dialogue;
        const original = dialogues[i].original;
        
        console.log(`[${i}/${dialogues.length}] ${dialogue}`)
        const sentences = dialogue.split('\\\N')
        let sentencesCounter = []

        if (sentences.length > 1) {
            sentencesCounter = sentences.map(s => s.split(' '))
            dialogue = sentences.join(" ")
        }

        const translation = await TranslationModel.findOne({ original: dialogue})
        if (translation) {
            dialoguesTranslated.push({
                original,
                from: dialogueOriginal,
                to: translation.translated
            })

            continue;
        }

        let translatedText = await translate(dialogue, { from: 'en', to: 'pt-br' });

        if (sentences.length > 1) {

            if (sentencesCounter[0].length - sentencesCounter[1].length < -3 || sentencesCounter[0].length - sentencesCounter[1].length > 3) {
                const words = translatedText.split(' ')
                words.splice(parseInt(words.length / 2), 0, '\\N')
                
                translatedText = words.join(' ').replace(' \\N ', '\\N')
            } else {
                const words = translatedText.split(' ')
                words.splice(sentencesCounter[0].length, 0, '\\N')
                
                translatedText = words.join(' ').replace(' \\N ', '\\N')
            }
            
        }

        console.log({
            dialogueOriginal,
            translatedText
        });

        dialoguesTranslated.push({
            original,
            from: dialogueOriginal,
            to: translatedText
        })

        await TranslationModel.create({ original: dialogueOriginal, translated: translatedText })        
    }


    const translated = lines.map(l => {
        const line = dialoguesTranslated.filter(t => t.original == l)

        if (line.length == 0) return l

        return l.replace(line[0].from, line[0].to)
    }).join('\r\n')

    subtitle.subtitles.push({             
        source: 'Automatic Translated',
        language: 'Portuguese (Brazil)',
        value: translated,
    })

    await subtitle.save()

    await fs.writeFileSync('/home/lourran/Downloads/Animes Store/hime_pt-br.ass', translated);
}

require('dotenv').config()
require('../utils/database').databaseInit()
process('', '10', '/home/lourran/Downloads/Animes Store/', 'hime.ass', 'English', 'SubsPlease')

// module.exports = {
//     process
// }
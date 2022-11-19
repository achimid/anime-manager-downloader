const fs = require('fs');
const { translate } = require('free-translate');

let cache = []



const saveDB = () => {    
    fs.writeFileSync('lines.json', JSON.stringify(cache, null, 4))
}

const readDB = () => {    
    try {
        cache = JSON.parse(fs.readFileSync('lines.json' ,{encoding:'utf8', flag:'r'}))        
    } catch (error) {}
}

(async () => {
    
    const lines = (await fs.readFileSync('/home/lourran/Downloads/Animes Store/hime.ass', { encoding: 'utf8' })).split('\r\n');
    const dialoguesLine = lines.filter(s => s.startsWith('Dialogue'))
    const dialogues = dialoguesLine.map(s => {
        return {
            original: s,
            dialogue: s.split(',').slice(9).join(',')
        }        
    })
    
    readDB()

    const dialoguesTranslated = []

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

        const isCached = cache.filter(v => v.from == dialogue)
        if (isCached.length > 0) {
            dialoguesTranslated.push({
                original,
                from: dialogueOriginal,
                to: isCached[0].to
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

        cache.push({
            from: dialogueOriginal,
            to: translatedText
        })

        saveDB()
    }


    const translated = lines.map(l => {
        const line = dialoguesTranslated.filter(t => t.original == l)

        if (line.length == 0) return l

        return l.replace(line[0].from, line[0].to)
    }).join('\r\n')

    await fs.writeFileSync('/home/lourran/Downloads/Animes Store/hime_pt-br.ass', translated);

})()

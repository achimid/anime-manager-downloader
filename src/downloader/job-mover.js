const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const { shouldConvertAnime } = require('./animestc/anime-service')

const moveFromDownloadToEncode = async () => {
    // console.log('moveFromDownloadToEncode...')

    const files = fs.readdirSync(process.env.DIR_TO_DOWNLOAD).filter(s => !s.endsWith(".crdownload"))
    const filesToEncode = files.filter(s => s.endsWith('.mkv')).filter(f => shouldConvertAnime(path.basename(f)))
    
    for (let i = 0; i < filesToEncode.length; i++) {
        const file = filesToEncode[i];
        
        const from = path.join(process.env.DIR_TO_DOWNLOAD, file)
        const to = path.join(process.env.DIR_TO_ENCODE, file)

        await move(from, to)
    }    
}

const moveFromDownloadToStore = async () => {
    // console.log('moveFromDownloadToStore...')

    const files = fs.readdirSync(process.env.DIR_TO_DOWNLOAD).filter(s => !s.endsWith(".crdownload"))
    const filesToEncode = files.filter(s => s.endsWith('.mkv')).filter(f => shouldConvertAnime(path.basename(f)))
    const filesNotToEncode = files.filter(x => !filesToEncode.includes(x))
    

    for (let i = 0; i < filesNotToEncode.length; i++) {
        const file = filesNotToEncode[i];
        
        const from = path.join(process.env.DIR_TO_DOWNLOAD, file)
        const to = path.join(process.env.DIR_TO_STORE, file)

        await move(from, to)
    }
}

const moveFromEncodedToStore = async () => {
    // console.log('moveFromEncodedToStore...')

    const files = fs.readdirSync(process.env.DIR_ENCODED)
    const filesEncodedToMove = files.filter(s => s.endsWith('.mp4'))
    
    for (let i = 0; i < filesEncodedToMove.length; i++) {
        const file = filesEncodedToMove[i];
        
        const from = path.join(process.env.DIR_ENCODED, file)
        const to = path.join(process.env.DIR_TO_STORE, file)

        await move(from, to)
    }

}

const moveFromStoreToAnimeFolder = () => new Promise((resolve) => {
    // console.log('moveFromStoreToAnimeFolder...')

    const ls = spawn('time', ['node MoveToFolder.js'], { shell: true, cwd: process.env.DIR_TO_STORE})

    ls.on("close", code => {                
        resolve()
    })
})

const move = (from, to) => new Promise((resolve) => {

    const command = `mv '${from}' '${to}'`    
    const ls = spawn('time', [command], { shell: true })

    console.log(`Movendo arquivos...: \nfrom: ${from} \nto: ${to}\n`)    

    ls.on("close", code => {        
        console.log(`Arquivo movido`)    
        resolve()
    })

})

const main = async () => {
    await moveFromDownloadToStore()
    await moveFromDownloadToEncode()
    await moveFromEncodedToStore()
    await moveFromStoreToAnimeFolder()
}

const start = () => {
    main()
    setInterval(main, 60000)
}

module.exports = {
    start
}

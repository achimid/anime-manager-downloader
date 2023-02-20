const stringSimilarity = require("string-similarity")

const { notify } = require('../utils/notify')

const atc = require('./animestc/atc-service')
const download = require('./animestc/download-service')
const animeService = require('./animestc/anime-service')


let running = false

const main = async () => {
        
        if (running) {
            console.log("Execução ignorada...")
            return
        }

        running = true
        console.log("Iniciando execução...")

        try {
            await execute()            
        } catch (error) {
            console.log("Execução finalizada com erro...")
            console.error("Error: ", error)
        }        

        console.log("Execução finalizada com sucesso...")
        running = false    

}

const execute = async () => {

    const atcAnimes = await atc.extractLinks()
    const atcAnimesToDownload = atcAnimes.filter(a => {
        const similarity = stringSimilarity.findBestMatch(a.title, animeService.ANIMES_TO_DOWNLOAD)
        return true
    }).filter(a => !animeService.animeAlreadyDownloaded(a.title))

    
    const linksToDownload = atcAnimesToDownload
        .map(a => [...a.FullHD, ...a.HD, ...a.SD])
        .map(d => d.filter(a => a.mirror == "Drive" || a.mirror == "Gofile"))    
    
    console.log(`\nForam encontrados ${atcAnimesToDownload.length} novos episódios para realizar o download`)
    atcAnimesToDownload.forEach(a => console.log(a.title))

    console.log('\n')
    for (let i = 0; i < linksToDownload.length; i++) {
        const animeMirror = linksToDownload[i];
        const animePost = atcAnimesToDownload[i]
        
        console.log('Downloading anime ', animePost.title)

        let fileDownload
        try {
            const driveLink = await atc.desprotectLink(animeMirror.filter(d => d.mirror == "Drive")[0].url)
            fileDownload = await download.drive(driveLink)    
        } catch (error) {
            const gofileLink = await atc.desprotectLink(animeMirror.filter(d => d.mirror == "Gofile")[0].url)
            fileDownload = await download.gofile(gofileLink)
        }

        console.log(fileDownload)

        animeService.saveAnimeDownloaded(animePost.title, fileDownload)

        notify(`[OK] ${animePost.title}`)
    }
    
}

main()
setInterval(main, 60000 * 5)

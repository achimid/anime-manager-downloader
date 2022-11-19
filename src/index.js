const path = require('path')
const stringSimilarity = require("string-similarity")

const { browserInit } = require('./utils/puppeteer')
const { initWebTorrent, createTorrentSeed } = require('./services/torrent-service')

const goanimes = require('./services/goanimes-service')
const atc = require('./services/atc-service')

const zippy = require('./services/zippy-service')
const gofile = require('./services/gofile-service')
const drive = require('./services/driver-service')

const animeService = require('./services/anime-service')


const main = async (browser) => {

    const page = (await browser.pages())[0]

    await page.setRequestInterception(true)
    page.on('request', async request => {if (request.resourceType() === 'image') {request.abort()} else {request.continue()}})   

    
    const atcAnimes = await atc.extractLinks(page)
    const atcAnimesToDownload = atcAnimes.filter(a => {
        const similarity = stringSimilarity.findBestMatch(a.title, animeService.ANIMES_TO_DOWNLOAD)
        return similarity.bestMatch.rating > 0.5        
    }).filter(a => !animeService.animeAlreadyDownloaded(a.title))

    
    const linksToDownload = atcAnimesToDownload
        .map(a => a.FullHD || a.HD)
        .map(d => d.filter(a => a.mirror == "Drive" || a.mirror == "Gofile"))    
    
    console.log(`\n Foram encontrados ${atcAnimesToDownload.length} novos episódios para realizar o download \n`)
    atcAnimesToDownload.forEach(a => console.log(a.title))

    console.log('\n')
    for (let i = 0; i < linksToDownload.length; i++) {
        const animeMirror = linksToDownload[i];
        const animePost = atcAnimesToDownload[i]
        
        console.log('Downloading anime ', animePost.title)

        let fileDownload
        try {
            const gofileLink = await atc.desprotectLink(page, animeMirror.filter(d => d.mirror == "Gofile")[0].url)
            fileDownload = await gofile.download(gofileLink)
        } catch (error) {
            const driveLink = await atc.desprotectLink(page, animeMirror.filter(d => d.mirror == "Drive")[0].url)
            fileDownload = await drive.download(driveLink)    
        }

        console.log(fileDownload)

        animeService.saveAnimeDownloaded(animePost.title, fileDownload)
        console.log('\n')
    }
        

    
    // const driveFirstAnimeUrl = await atc.desprotectLink(page, atcAnimes[1].FullHD.filter(d => d.mirror == "Drive")[0].url)
    // const gofileFirstAnimeUrl = await atc.desprotectLink(page, atcAnimes[1].FullHD.filter(d => d.mirror == "Gofile")[0].url)

    // const fileDriveDownloaded = await drive.download(page, driveFirstAnimeUrl)
    // const fileGofileDownloaded = await gofile.download(page, gofileFirstAnimeUrl)

    // const magnetLinkDrive = await createTorrentSeed(fileDriveDownloaded)
    // const magnetLinkGofile = await createTorrentSeed(fileGofileDownloaded)

    // console.log(magnetLinkDrive)
    // console.log(magnetLinkGofile)

    return browser
}
const { delay } = require('./utils/commons')

const main2 = async (browser) => {
    const page = await browser.newPage()

    await page.goto('https://animesup.biz/episodios/mushikaburi-hime-1-episodio-6/')
    await delay(5000)
    await page.evaluate(`[...document.querySelectorAll('#playeroptionsul > li')].slice(-1)[0].click()`)
    // await page.evaluate('document.body.innerHTML += \`<a id="downloadLink" href="\${player.getConfig().playlistItem.file}" download="video">Download</a>\`;document.querySelector("#downloadLink").click()')    

    console.log('teste')
}

initWebTorrent()
    .then(browserInit)
    .then(main)
    // .then(browser =>  browser.close())
    // .then(() => {
    //     console.log('Encerrando execução!')
    //     process.exit(0)
    // })
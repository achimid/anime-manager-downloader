const path = require('path')

const browserInit = require('./utils/puppeteer')
const { initWebTorrent, createTorrentSeed } = require('./services/torrent-service')

const goanimes = require('./services/goanimes-service')
const atc = require('./services/atc-service')

const zippy = require('./services/zippy-service')
const gofile = require('./services/gofile-service')
const drive = require('./services/driver-service')

const main = async (browser) => {

    // V1
    // Buscar os animes do ATC
    // Verificar se ja fiz o download desse anime (anime-service)
    // Realizar o download da melhor qualidade no ATC
    // Salvar o anime como baixado
    // Mover o anime para a pasta correta















    const page = await browser.newPage()

    await page.setRequestInterception(true)
    page.on('request', async request => {if (request.resourceType() === 'image') {request.abort()} else {request.continue()}})   

    
    const atcAnimes = await atc.extractLinks(page)
    
    const driveFirstAnimeUrl = await atc.desprotectLink(page, atcAnimes[1].FullHD.filter(d => d.mirror == "Drive")[0].url)
    // const gofileFirstAnimeUrl = await atc.desprotectLink(page, atcAnimes[1].FullHD.filter(d => d.mirror == "Gofile")[0].url)

    const fileDriveDownloaded = await drive.download(page, driveFirstAnimeUrl)
    // const fileGofileDownloaded = await gofile.download(page, gofileFirstAnimeUrl)

    const magnetLinkDrive = await createTorrentSeed(fileDriveDownloaded)
    // const magnetLinkGofile = await createTorrentSeed(fileGofileDownloaded)

    console.log(magnetLinkDrive)
    // console.log(magnetLinkGofile)

    return browser
}

initWebTorrent()
    .then(browserInit)
    .then(main)
    .then(browser =>  browser.close())
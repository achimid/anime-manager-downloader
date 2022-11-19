const puppeteer = require('puppeteer-extra')

const proxy = process.env.PROXY_SERVER

const browserInit = async () => {
    console.info('Inicializando browser...')    
    
    global.browser = await puppeteer.launch(
        {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-dev-shm-usage',
                '--window-size=1024,768',
                proxy ? `--proxy-server=${proxy}` : ''
            ],
            userDataDir: '/tmp/pp'
        })
    
    
        
    console.info('Browser inicializado...')

    return global.browser
}

const executeBrowser = async (cbFunction) => {
    const browser = await puppeteer.launch(
        {
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-dev-shm-usage',
                '--window-size=550,550',
                proxy ? `--proxy-server=${proxy}` : ''
            ],
            userDataDir: '/tmp/pp'
        })

    const page = (await browser.pages())[0]
    await page.setRequestInterception(true)
    page.on('request', async request => {if (request.resourceType() === 'image') {request.abort()} else {request.continue()}})   


    let rt
    try {
        rt = await cbFunction(page)    
        await browser.close()
    } catch (error) {        
        await browser.close()
        throw error
    }

    return rt
}

module.exports = {
    browserInit,
    executeBrowser
}
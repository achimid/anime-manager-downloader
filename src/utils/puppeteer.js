const puppeteer = require('puppeteer-extra')

const proxy = process.env.PROXY_SERVER

const browserInit = async () => {
    console.info('Inicializando browser...')    
    
    global.browser = await puppeteer.launch(
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
                '--window-size=1024,768',
                proxy ? `--proxy-server=${proxy}` : ''
            ],
            userDataDir: '/tmp/pp'
        })
        
    console.info('Browser inicializado...')

    return global.browser
}

module.exports = browserInit
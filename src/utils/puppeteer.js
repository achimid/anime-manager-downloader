const puppeteer = require('puppeteer-extra')

const executeBrowser = async (cbFunction, skipImage = false) => {
    console.time("page.execution.time")

    const browser = await puppeteer.launch(
        {
            headless: true,
            args: [
                '--no-sandbox', 
                '--ignore-certificate-errors',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-dev-shm-usage',
                '--window-size=1024,768',
            ],
            userDataDir: '/tmp/pp'
        })

    const page = (await browser.pages())[0]

    if(skipImage) {
        await page.setRequestInterception(true)
        page.on('request', async request => {if (request.resourceType() === 'image') {request.abort()} else {request.continue()}})   
    }
    

    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: process.env.DIR_TO_DOWNLOAD,
    })

    let rt
    try {
        rt = await cbFunction(page)    
        await browser.close()
    } catch (error) {        
        await browser.close()
        throw error
    } finally {
        console.timeEnd("page.execution.time")
    }

    return rt
}

module.exports = {
    executeBrowser
}
const { getPage, delay } = require('../../utils/commons')

const upload = async (p, fileToUpload) => {
    const page = await getPage(p)    
    await page.goto('https://www.zippyshare.com/');

    const inputUploadHandle = await page.$('input[type=file]');
    inputUploadHandle.uploadFile(fileToUpload);

    await delay(2000)

    console.log('Realizando upload...')
    
    await page.evaluate(`document.querySelector('#share_button').click()`)
    await page.waitForSelector('#plain-links')

    await page.waitForFunction(
        () => {                        
            return document.querySelector('#plain-links').value != ""
        },
        { polling: 'raf', timeout: 0 },
    )
    
    const url = await page.evaluate(`document.querySelector('#plain-links').value`)
    
    console.log('Upload finalizado')
    console.log(url)
    
    await page.close()
    await browser.close()

    return url
}


const download = async (url) => {
    return downloadAction(url, async (page) => {
        await page.waitForFunction(
            () => { return !!document.querySelector('#uc-download-link')},
            { polling: 'raf', timeout: 1000 },
        )

        await page.evaluate(`document.querySelector('#uc-download-link').click()`)
    }) 

    const browser = await puppeteer.launch({ headless: false });        
    const page = await browser.newPage();
    await page.goto(url);
        
    await page.evaluate(`document.querySelector('#dlbutton').click();`);

    await delay(2000);

    await page.goto('chrome://downloads/');
    await page.bringToFront()

    await delay(2000);

    console.log("Realizando download...")

    await page.waitForFunction(
        () => {            
            const dm = document.querySelector('downloads-manager').shadowRoot
            return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').parentElement.hidden
        },
        { polling: 'raf', timeout: 0 },
    )

    const path = await page.evaluate(`
        dm = document.querySelector('downloads-manager').shadowRoot
        dm.querySelector('#frb0').shadowRoot.querySelector('#show').title
    `)

    console.log("Download finalizado")    

    return path
}

// Outro site de free upload com 15 dias de expiration sem download

module.exports = {
    upload,
    download
}
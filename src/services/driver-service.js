const { delay } = require('../utils/commons')
const { executeBrowser } = require('../utils/puppeteer')

const download = async (url) => {
    return executeBrowser(async (page) => {
        console.log("Nevigate to Drive Download page")
        
        try {
            console.log("Trying to start download")
        
            await page.goto(parserToDownloadLink(url));
            await page.waitForFunction(
                () => {            
                    return !!document.querySelector('#uc-download-link')
                },
                { polling: 'raf', timeout: 1000 },
            )

            const fileName = await page.evaluate(`document.querySelector('a').innerText`)
            console.log("File Name: " + fileName)

            await page.evaluate(`document.querySelector('#uc-download-link').click()`)
        } catch (error) {
            console.error("!!!!! Error on download from Drive !!!!! ")
            await page.close()
            throw error
        }
        
        
        console.log("Checking for download status")
        await delay(2000)

        await page.goto('chrome://downloads/')
        await page.bringToFront()

        
        await delay(2000);

        console.log("Waiting for download")
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

        await page.evaluate(`dm.querySelector('#frb0').shadowRoot.querySelector('#remove').click()`)        
        await page.close()

        return path
    })    
}

const parserToDownloadLink = (viewLink) => {    
    if (viewLink.indexOf('export=download') >= 0) return viewLink

    const fileId = viewLink.replace('https://drive.google.com/file/d/', '').replace('/view', '').replace('?usp=sharing', '')
    const driveUrlExport = `https://drive.google.com/u/1/uc?id=${fileId}&export=download`

    return driveUrlExport   
}

module.exports = {
    download,
    parserToDownloadLink
}
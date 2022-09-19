const { getPage, delay } = require('../utils/commons')

const download = async (p, url) => {
    const page = await getPage(p)    

    console.log("Nevigate to GoFile Download page")
    
    try {
        console.log("Trying to start download")
        
        await page.goto(url);
        await page.waitForFunction(
            () => {            
                return !!document.querySelector('#contentId-download')
            },
            { polling: 'raf', timeout: 0 },
        )

        const fileName = await page.evaluate(`document.querySelector('.contentName').innerText`)
        console.log("File Name: " + fileName)

        await page.evaluate(`document.querySelector('#contentId-download').click()`);
    } catch (error) {
        console.error("!!!!! Error on download from Gofile !!!!! ")
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

    return path
}


module.exports = {
    download
}
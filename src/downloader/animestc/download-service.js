const downloadAction = require('../../utils/download')


const gofile = async (url) => {
    return downloadAction(url, async (page) => {
        await page.waitForFunction(
            () => { return !!document.querySelector('#filesContentTableContent .bi.bi-file-earmark-arrow-down')},
            { polling: 'raf', timeout: 0 },
        )

        await page.evaluate(`document.querySelector('#filesContentTableContent .bi.bi-file-earmark-arrow-down').click()`)
    })    
}

const drive = async (url) => {
    return downloadAction(url, async (page) => {
        await page.waitForFunction(
            () => { return !!document.querySelector('#uc-download-link')},
            { polling: 'raf', timeout: 1000 },
        )

        await page.evaluate(`document.querySelector('#uc-download-link').click()`)
    })    
}


module.exports = {
    gofile,
    drive
}
const getPage = async (page) => {
    if (page) return page

    const browser = global.browser
    return browser.newPage()
}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    })
}

module.exports = {
    getPage,
    delay
}
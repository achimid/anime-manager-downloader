const fetch = require('node-fetch')

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const notify = async (text) => {

    var raw = JSON.stringify({
        token: TELEGRAM_TOKEN,
        id: TELEGRAM_CHAT_ID,
        text
    });

    var requestOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: raw,
    };

    fetch("https://telegram-notify-api.achimid.com.br/api/v1/message/send", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

}

module.exports = {
    notify
}
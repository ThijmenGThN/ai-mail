import 'dotenv/config'
import * as AI from './libs/AI.js'
import * as IMAP from './libs/IMAP.js'

async function main() {
    console.log('Checking for E-Mails..')
    const emails = await IMAP.fetch()

    emails.forEach(async item => {
        const response = await AI.compose(item.text)

        IMAP.send({
            to: item.author,
            subject: response.subject,
            text: response.body
        })

        console.log('An E-Mail has been sent to', item.author)
    })
}

main()
setInterval(() => main(), 10 * 1000)

process.on('uncaughtException', () => { })
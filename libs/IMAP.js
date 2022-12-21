import Imap from 'imap'
import mailer from 'nodemailer'
import { simpleParser } from 'mailparser'

const compose = new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: 993,
    tls: true
})

const sender = mailer.createTransport({
    host: process.env.IMAP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
    }
})

export const fetch = async () => new Promise(async res => {
    compose.connect()

    await compose.once('ready', () => {
        compose.openBox('INBOX', false, async err => {
            compose.search(['UNSEEN', ['TO', process.env.IMAP_RECIEVER]], (err, results) => {
                let inbox = compose.fetch(results, { bodies: '', markSeen: true, struct: true })

                // compose.setFlags(results, ['\\Seen'])

                let collect = []
                inbox.on('message', m => {
                    m.on('body', stream => {
                        simpleParser(stream, (err, { from, text }) => collect.push({
                            author: from.value[0].address,
                            text
                        }))
                    })
                })

                setTimeout(() => {
                    res(collect ? collect : [])
                    compose.end()
                }, 2000)
            })
        })
    })
})

export const send = async ({ from, to, subject, text }) => {
    await sender.sendMail({
        from: process.env.IMAP_RECIEVER,
        to, subject, text
    })
}

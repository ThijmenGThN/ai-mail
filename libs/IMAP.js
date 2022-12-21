// import imaps from 'imap-simple2'
import Imap from 'imap'
import { simpleParser } from 'mailparser'

const imap = new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: 993,
    tls: true
})

export const fetch = async () => new Promise(async res => {
    imap.connect()

    await imap.once('ready', () => {
        imap.openBox('INBOX', false, async err => {
            if (err) throw err

            imap.search(['UNSEEN', ['TO', 'ai@thijmenheuvelink.nl']], (err, results) => {
                let inbox = imap.fetch(results, { bodies: '', markSeen: false, struct: true })

                imap.setFlags(results, ['\\Seen'])

                inbox.on('message', m => {
                    m.on('body', stream => {
                        simpleParser(stream, (err, { to, from, text }) => res({
                            reciever: to.value[0].address,
                            author: from.value[0].address,
                            text
                        }))
                    })
                })

                imap.end()
            })
        })
    })
})

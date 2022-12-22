import Imap from 'imap'
import mailer from 'nodemailer'
import { simpleParser } from 'mailparser'

// Connect to an IMAP server
const compose = new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: 993,
    tls: true
})

// Connect to an SMTP server
const sender = mailer.createTransport({
    host: process.env.IMAP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
    }
})

// Asynchronously fetch and parse the contents of unread emails in the INBOX of an IMAP account
export const fetch = async () => new Promise(async res => {
    // Connect to the IMAP server
    compose.connect()

    // Wait until the connection is ready
    await compose.once('ready', () => {
        // Open the INBOX folder
        compose.openBox('INBOX', false, async err => {
            // Search for unread emails sent to the specified recipient
            compose.search(['UNSEEN', ['TO', process.env.IMAP_RECIEVER]], (err, results) => {
                // Fetch the contents of the found emails
                let inbox = compose.fetch(results, { bodies: '', markSeen: true, struct: true })

                // Mark E-mails as read, to filter them out for next iteration.
                compose.setFlags(results, ['\\Seen'])

                let collect = []
                // Process the contents of each email
                inbox.on('message', m => {
                    m.on('body', stream => {
                        simpleParser(stream, (err, { from, text }) => collect.push({
                            author: from.value[0].address,
                            text
                        }))
                    })
                })

                // Wait two seconds and resolve the promise with the collected emails
                setTimeout(() => {
                    res(collect ? collect : [])
                    // Close the connection to the IMAP server
                    compose.end()
                }, 2000)
            })
        })
    })
})

// Asynchronously send an email via an SMTP server
export const send = async ({ to, subject, text }) => {
    // Send the email using the SMTP transport
    await sender.sendMail({
        from: process.env.IMAP_RECIEVER,
        to, subject, text
    })
}

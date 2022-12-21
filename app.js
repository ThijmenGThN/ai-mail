import 'dotenv/config'
import AI from './libs/ai.js'
import imaps from 'imap-simple2'
import cheerio from "cheerio"
import mailer from 'nodemailer'
import { simpleParser } from 'mailparser'

async function main() {
    try {
        console.log('Connect to mailbox..')
        const mailbox = await imaps.connect({
            imap: {
                user: process.env.IMAP_USER,
                password: process.env.IMAP_PASSWORD,
                host: process.env.IMAP_HOST,
                port: 993,
                tls: true,
                authTimeout: 3000
            }
        })
        await mailbox.openBox('INBOX')

        console.log('Searching for emails..')
        const results = await mailbox.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT'], markSeen: true })

        if (!results[0]) return mailbox.end()
        if (!(results[0].parts[0].body.to[0].split(' ')[0].includes("ai@thijmenheuvelink.nl") || results[0].parts[0].body.to[0].split(' ')[1].includes("ai@thijmenheuvelink.nl"))) return mailbox.end()

        const author = results[0].parts[0].body['return-path'][0].replace('<', '').replace('>', '')
        console.log('Got an email from', author)

        let inBase64Message = false;
        let base64Message = "";

        for (const line of results[0].parts[1].body.split('\n')) {
            if (line.startsWith("Content-Transfer-Encoding: base64")) {
                inBase64Message = true;
            } else if (line.startsWith("Content-Type") || line.startsWith("--")) {
                inBase64Message = false;
            } else if (inBase64Message) {
                base64Message += line;
            }
        }

        let $ = cheerio.load(Buffer.from(base64Message, "base64").toString("utf8"))
        let message = $("div[dir='auto']").text()

        console.log('Prepairing to send email..')
        let service = mailer.createTransport({
            host: config.host,
            port: 465,
            secure: true,
            auth: {
                user: config.user,
                pass: config.password
            }
        })

        if (!message) message = await (await simpleParser(results[0].parts[1].body)).text.split('--')[0]

        const response = await AI(message)

        console.log('Sending email..')
        await service.sendMail({
            from: '"AI" <ai@thijmenheuvelink.nl>',
            to: author,
            subject: response.subject,
            text: response.body
        })

        console.log('An email has been sent to', author)

        mailbox.end()
    } catch (err) { console.log(err) }
}

main()
setInterval(() => main(), 60 * 1000)
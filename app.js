import 'dotenv/config'
import * as AI from './libs/AI.js'
import * as IMAP from './libs/IMAP.js'
import mailer from 'nodemailer'

async function main() {
    console.log(await IMAP.fetch())
}

main()
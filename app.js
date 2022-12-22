import 'dotenv/config' // Import the configuration from the .env file
import * as AI from './libs/AI.js' // Import the AI library
import * as IMAP from './libs/IMAP.js' // Import the IMAP library

// main function that polls for changes in the inbox and sends a response using AI
async function main() {
    console.log('Polling for changes in inbox..')
    const emails = await IMAP.fetch() // fetch the emails from the inbox

    // iterate through each email and send a response
    emails.forEach(async item => {
        const response = await AI.compose(item.text) // generate a response using AI

        // send the response email
        IMAP.send({
            to: item.author,
            subject: response.subject,
            text: response.body
        })

        console.log('An E-Mail has been sent to', item.author, '\nContent:', response)
    })
}

// run the main function initially
main()
// set up a recurring interval to run the main function at the specified poll rate
setInterval(() => main(), process.env.POLL_RATE * 1000)

// set up an uncaughtException event listener to prevent the program from crashing
process.on('uncaughtException', () => { })

import { Configuration, OpenAIApi } from "openai"

const config = new Configuration({ apiKey: process.env.OPENAI_KEY })
const openai = new OpenAIApi(config)

export default async function (content) {
    const dataSheet = `A stranger has sent you an email, respond kindly and be sure to match their language:\n\n"${content}"\n\nAI: "`

    console.log('Generating a response..')
    const bo = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: dataSheet,
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"]
    })

    let body = ('"' + bo.data.choices[0].text).replace(/(^"|"$)/g, '')

    console.log('Generating a subject..')
    const su = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Think of a subject for the following email:\n\n"${body}"\n\nAI: "`,
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"]
    })

    let subject = ('"' + su.data.choices[0].text).replace(/(^"|"$)/g, '')

    console.log('Done, generating.')

    return { body, subject }
}
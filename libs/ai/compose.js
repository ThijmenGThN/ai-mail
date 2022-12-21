import { Configuration, OpenAIApi } from "openai"

const config = new Configuration({ apiKey: process.env.OPENAI_KEY })
const openai = new OpenAIApi(config)

export default async function (content) {
    const dataSheet = `A stranger has sent you an email, respond kindly and be sure to match their language:\n\n"${content}"\n\nAI: "`

    const gen = async prompt =>
        await openai.createCompletion({
            model: "text-davinci-003",
            temperature: 0.9,
            max_tokens: 150,
            top_p: 1,
            prompt,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: [" Human:", " AI:"]
        })

    return {
        body: ('"' + (await gen(dataSheet)).data.choices[0].text).replace(/(^"|"$)/g, ''),
        subject: ('"' + (await gen(`Think of a subject for the following email:\n\n"${body}"\n\nAI: "`)).data.choices[0].text).replace(/(^"|"$)/g, '')
    }
}
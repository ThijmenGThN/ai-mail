import { Configuration, OpenAIApi } from "openai"
import dialog from '../dialog.json' assert { type: "json" }

const config = new Configuration({ apiKey: process.env.OPENAI_KEY })
const openai = new OpenAIApi(config)

export const compose = async function (content) {
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
        subject: ('"' + (await gen(`${dialog.subject}:\n\n"${content}"\n\nAI: "`)).data.choices[0].text).replace(/(^"|"$)/g, ''),
        body: ('"' + (await gen(`${dialog.body}:\n\n"${content}"\n\nAI:`)).data.choices[0].text).replace(/(^"|"$)/g, '')
    }
}
import { Configuration, OpenAIApi } from "openai"
import dialog from '../dialog.json' assert { type: "json" }

// Configuration object to authenticate with the OpenAI API
const config = new Configuration({ apiKey: process.env.OPENAI_KEY })

// Create an instance of the OpenAI API using the configuration object
const openai = new OpenAIApi(config)

// Export the compose function, which uses the OpenAI API to generate text completions
export const compose = async function (content) {
    // Asynchronously generate a text completion using the OpenAI API
    const gen = async prompt =>
        await openai.createCompletion({
            // Use the text-davinci-003 model to generate completions
            model: "text-davinci-003",
            // Use a temperature of 0.9 to encourage more diverse completions
            temperature: 0.9,
            // Generate completions with a maximum of 150 tokens
            max_tokens: 150,
            // Use the top_p parameter to ensure the most likely completions are returned
            top_p: 1,
            // Provide the prompt for the completion
            prompt,
            // Set the frequency penalty to 0 to not penalize common words
            frequency_penalty: 0,
            // Set the presence penalty to 0.6 to encourage the model to generate novel text
            presence_penalty: 0.6,
            // Use the "Human:" and "AI:" strings to indicate the end of the completion
            stop: [" Human:", " AI:"]
        })

    // Return the generated subject and body of the email as an object
    return {
        subject: ('"' + (await gen(`${dialog.subject}:\n\n"${content}"\n\nAI: "`)).data.choices[0].text).replace(/(^"|"$)/g, ''),
        body: ('"' + (await gen(`${dialog.body}:\n\n"${content}"\n\nAI:`)).data.choices[0].text).replace(/(^"|"$)/g, '')
    }
}

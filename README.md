## AI-mail
Automated E-mail replier based on OpenAI's Davinci-003 language model.

### How it works
When you receive an E-mail (customizable in the ` .env ` file), the AI will analyze the E-Mail and return a response to the sender with the AI's processed output.

### Getting started
Make sure to clone this repo to get started with the AI, you'd also need docker to run it effectively.

Rename ` .env.local ` to ` .env `, then fill in the required credentials.

Here's an example of how to run it, be sure to change the volume to your local path.
```
docker run \
    -v /root/env/ai-mail:/usr/app \
    -w /usr/app \
    --name ai-mail \
    --restart unless-stopped \
    -d node:lts-alpine yarn ci
```

### Configuration
You can customize the behavior of the AI by modifying the ` dialog.json ` file.

### Contributions
We welcome contributions! If you have an idea for a new feature or have found a bug, please open an issue or submit a pull request.

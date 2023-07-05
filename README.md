# Telegram Events Notifcation
---
A simple Github action that sends a Telegram message when:
1. Pull request open
2. Pull request review requested
3. New push commit event
---
#### Example 

```yml 
on:
  pull_request:
    types: [opened, review_requested]
  push:
    branches:
      - main
```
<br/>
You can include this action in your workflow as follow

```yml
- name: Send events to telegram
  uses: F2had/pr-telegram-action@v1.0.0
  with: 
    bot_token: '${{ secrets.BotToken }}' # Your bot token from github secrets
    chat_id: '${{ secrets.CHATID }}' # Your chat id from github secrets
```


`Github Secrets:` To add your bot toekn and chat id as a github secret  you can refer to [Github docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). <br>

`Bot Token:` To get a bot token you need to use [BotFather](https://t.me/botfather) on Telegram
or refer to [this](https://core.telegram.org/bots#3-how-do-i-create-a-bot) on how to create a bot.

`Chat ID:` You may use this [RawDataBot](https://t.me/RawDataBot) to get the chat id the for a group or a channel.

---

### Full workflow example.
[workflow-example.yml](https://github.com/F2had/pr-telegram-action/blob/master/workflow-example.yml).

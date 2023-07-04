/* eslint-disable */
import * as core from '@actions/core'
import * as github from '@actions/github'
import sendMessage from './sendMessage'
import {PullRequestEvent, PushEvent} from '@octokit/webhooks-definitions/schema'

export async function run(): Promise<void> {
  try {
    const botToken = core.getInput('bot_token')
    const chatId = core.getInput('chat_id')

    // const botToken = '5068720431:AAHrc4_uv-0bldBIcM0ecVe9nSZT-ENVryU';
    // const chatId = '-1001233093277';
    const uri = `https://api.telegram.org/bot${botToken}/sendMessage`

    if (!botToken || !chatId) {
      throw new Error('bot_token and chat_id are required')
    }

    let case_name: String = github.context.eventName
    switch (case_name) {
      case 'push': {
        const payload = github.context.payload as PushEvent
        const {commits, ref, repository, sender} = payload

        let commits_obj_list: any[] = []
        for (let i = 0; i < commits.length; i++) {
          let commits_data: [string, string, string] = [
            commits[i].id,
            commits[i].url,
            commits[i].message
          ]
          commits_obj_list.push(commits_data)
        }

        // const message = `${commits_obj_list}  ${ref}  ${repository.name}  ${sender.login}`

        const message = `🔄 *New push commit event* \\\
        *CommitID:* ${commits_obj_list[0][0]}
        *Message:* ${commits_obj_list[0][2]}
        *Repo:* ${repository.name}
        *By:* [${sender.login}](https://github.com/${sender.login})
        [View commit](${commits_obj_list[0][1]})
        `
        // const message = `test test`
        console.log(message)
        await sendMessage(chatId, message, uri)

        console.log(`i am hereaaa\n ${message}`)
        break
      }
      case 'pull_request': {
        const payload = github.context.payload as PullRequestEvent
        const message = formatMessage(payload)
        await sendMessage(chatId, message, uri)
        break
      }
      default: {
        throw new Error('This action only works on specific events')
        break
      }
    }
    core.setOutput('Finshed time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(`${error.message}`)
  }
}

// Format the message based on the event type, new pull or review request.
const formatMessage = (payload: PullRequestEvent): string => {
  const {action, pull_request, repository, sender, number} = payload
  const {name, owner} = repository
  const {title} = pull_request
  let message = ''
  const prTitle = escapeMarkdown(title)
  const ownerName = escapeMarkdown(owner.login)
  const repoName = escapeMarkdown(name)
  const senderName = escapeMarkdown(sender.login)

  switch (action) {
    case 'opened':
      message = `🔄 *Pull Request* \\\#${number}
      On [${ownerName}/${repoName}](https://github.com/${ownerName}/${repoName}/pull/${number})
      *Title:* ${prTitle}
      *By:* [${senderName}](https://github.com/${senderName})
      [View Pull Request](https://github.com/${ownerName}/${repoName}/pull/${number})
      `
      console.debug('Message: ', message)
      return message

    case 'review_requested':
      const {requested_reviewer} = payload
      const {login: reviewer} = requested_reviewer
      const reviewerName = escapeMarkdown(reviewer)
      message = `📝  *Review Request* 
      On \\\#${number} [${ownerName}/${repoName}]\(https://github.com/${ownerName}/${repoName}/pull/${number}\) 
      *Title:* ${prTitle}
      *By:* [${senderName}](https://github.com/${senderName})
      *For:* [${reviewerName}](https://github.com/${reviewerName})
      [View Request](https://github.com/${ownerName}/${repoName}/pull/${number})
      `
      console.debug('Message: ', message)
      return message
    default:
      throw new Error(`Unsupported action: ${action}`)
  }
}

/*Escape markdown characters based on
  https://core.telegram.org/bots/api#markdownv2-style
  ignore pre and code entities as we do not use.
*/
const escapeMarkdown = (text: string): string => {
  return text.replace(/([_*\[\]()~`>#+-=|{}\.!])/g, '\\$1')
}

run()


const request = require('request')

const buildDataCard = details => {
  const { repository, commits, total_commits_count } = details
  const count = commits.length > 5 ? 5 : commits.length
  const btns = commits.reduce((pre, next) => {
    pre.push({
      title: next.message.replace('\n', ''),
      actionURL: next.url
    })
    return pre
  }, [])
  const data = {
    actionCard: {
      title: `${repository.name}代码更新`,
      text: `${repository.name}代码更新：${count}/${total_commits_count}`,
      hideAvatar: '0',
      btnOrientation: '0',
      btns: btns
    },
    msgtype: 'actionCard'
  }
  return data
} 

function parseMessage (message) {
  if (message.indexOf('Merge') !== -1) {
    // let fromName = /Merge branch \'([^\']+)\'/g.exec(message)
    // let from = fromName ? fromName[1]: 'from解析出错'

    // let toName = /into (.+)/g.exec(message)
    // let to = toName ? toName[1] : 'to解析出错'
    // to = to.replace(/\'/g, '')
    return ''
  } else {
    return message.replace('/n', '')
  }
}

const buildDataMd = details => {
  const { repository, commits, total_commits_count } = details
  let count = 0

  let modifiedFiles = {}
  function collectPublic (modified) {
    modified.forEach(item => {
      if (/(public)/g.exec(item)) {
        modifiedFiles[item] = 1
      }
    });
  }

  let msg = ''
  let name = ''

  let text = commits.reduce((pre, next) => {
    collectPublic(next.modified)
    msg = parseMessage(next.message)

    if (msg) {
      count++
      name = next.author ? next.author.name : ''
      pre += `- ${name}：[${msg}](${next.url})\n\n`
    }
    
    return pre
  }, `#### ${repository.name}代码更新：${count}/${total_commits_count}\n\n`)

  const modifiedFilesArray = Object.keys(modifiedFiles)
  const modifiedCount = modifiedFilesArray.length
  if (modifiedCount) {
    text += `\n#### 公共文件更新：${modifiedCount}\n\n`
    text = modifiedFilesArray.reduce((pre, next) => {
      pre += `> ${next}\n`
      return pre
    }, text)
  }

  const data = {
    msgtype: 'markdown',
    markdown: {
      title: `${repository.name}代码更新`,
      text
    },
    at: {
      atMobiles: [],
      isAtAll: false
    }
  }

  return data
}

function httprequest(url, requestData, cb) {
  request({
    url: url,
    method: 'POST',
    json: true,
    headers: {
      "content-type": "application/json",
    },
    body: requestData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb && cb(body)
    }
  })
}

module.exports = {
  buildDataCard,
  buildDataMd,
  httprequest
}

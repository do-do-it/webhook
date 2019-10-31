
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

const buildDataMd = details => {
  const { repository, commits, total_commits_count } = details
  const count = commits.length > 5 ? 5 : commits.length
  const text = commits.reduce((pre, next) => {
    pre += `> [${next.message}](${next.url})\n`
    return pre
  }, `${repository.name}代码更新：${count}/${total_commits_count}\n`)
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

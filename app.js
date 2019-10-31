const http = require('http')
const createGithubHandler = require('node-github-webhook')
const createGitlabHandler = require('node-gitlab-webhook')
const config = require('./app.config')
const handlers = require('./handlers')

const githubApps = require('./github.config')
const githubHandler = createGithubHandler(githubApps)

const gitlabApps = require('./gitlab.config')
const gitlabHandler = createGitlabHandler(gitlabApps)

http.createServer(function (req, res) {
  if(req.url.indexOf('gitlab') !== -1) {
    console.log(req.url)
    gitlabHandler(req, res, function (err) {
      res.statusCode = 404
      res.end('no such location')
    })
  } else {
    githubHandler(req, res, function (err) {
      res.statusCode = 404
      res.end('no such location')
    })
  }
}).listen(config.port)

githubHandler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )

  for (let i = 0; i < githubApps.length; i++) {
    const app = githubApps[i]
    if (app.path == event.path) {
      runCmd('sh', [`/srv${app.path}/deploy.sh`, event.payload.repository.name], function (text) { console.log(text) })
      break
    }
  }
})

gitlabHandler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )

  for (let i = 0; i < gitlabApps.length; i++) {
    let app = gitlabApps[i]
    if (app.path == event.path) {
      let dir = app.path.split('/gitlab/')[1]
      if (handlers[dir]) {
        handlers[dir](event.payload)
      } else {
        runCmd('sh', [`/srv/${dir}/deploy.sh`, event.payload.repository.name], function (text) { console.log(text) })
      }
      break
    }
  }
})

function runCmd(cmd, args, callback) {
  const spawn = require('child_process').spawn
  const child = spawn(cmd, args)
  let resp = ''
  child.stdout.on('data', function (buffer) {
    resp += buffer.toString()
  })
  child.stdout.on('end', function () {
    callback(resp)
  })
}

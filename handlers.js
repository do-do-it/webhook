const { buildDataMd, httprequest } = require('./util')

const tuia = details => {
  const data = buildDataMd(details)
  const url = 'https://oapi.dingtalk.com/robot/send?access_token=cf5ec7ef6aec555351bcba94f9f811e65e1f742a24f8541904ca2d8da56fba50'
 
  httprequest(url, data)
}

module.exports = {
  tuia
}
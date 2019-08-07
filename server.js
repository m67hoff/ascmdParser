#!/usr/bin/env node
'use strict'

const log = require('npmlog')
const LOGLEVEL = 'info'
const LOGOUTPUT = process.stdout
log.stream = LOGOUTPUT
log.level = LOGLEVEL

const program = require('commander')
const packagejson = require('./package.json')

const SSH2Promise = require('ssh2-promise')
const Parser = require('binary-parser').Parser

const field = new Parser()
  .int8('index')
  .int32be('len')
  .buffer('data', {
    length: 'len'
  })

const bufList = new Parser()
  .array('fieldList', {
    type: field,
    readUntil: 'eof'
  })

const itemParser = {}
itemParser.zstr = new Parser().string('val', { zeroTerminated: true })
itemParser.int32 = new Parser().int32be('val')
itemParser.int64 = new Parser().int64be('val')

const result_enum = [
  { name: 'x', type: 'nil' },
  { name: 'file', type: 'file' },
  { name: 'dir', type: 'file_list' },
  { name: 'size', type: 'size' },
  { name: 'error', type: 'error' },
  { name: 'info', type: 'info' },
  { name: 'success', type: 'nil' },
  { name: 'exit', type: 'nil' },
  { name: 'df', type: 'mnt,' },
  { name: 'md5sum', type: 'md5sum' }
]

const file_enum = [
  { name: 'x', type: 'nil' },
  { name: 'name', type: 'zstr' },
  { name: 'size', type: 'int64' },
  { name: 'mode', type: 'int32' },
  { name: 'zmode', type: 'zstr' },
  { name: 'uid', type: 'int32' },
  { name: 'zuid', type: 'zstr' },
  { name: 'gid', type: 'int32' },
  { name: 'zgid', type: 'zstr' },
  { name: 'ctime', type: 'int64' },
  { name: 'zctime', type: 'zstr' },
  { name: 'mtime', type: 'int64' },
  { name: 'zmtime', type: 'zstr' },
  { name: 'atime', type: 'int64' },
  { name: 'zatime', type: 'zstr' },
  { name: 'symlink', type: 'zstr' },
  { name: 'errno', type: 'int32' },
  { name: 'errstr', type: 'zstr' }
]
const info_enum = [
  { name: 'x', type: 'nil' },
  { name: 'platform', type: 'zstr' },
  { name: 'version', type: 'zstr' },
  { name: 'lang', type: 'zstr' },
  { name: 'territory', type: 'zstr' },
  { name: 'codeset', type: 'zstr' },
  { name: 'lc_ctype', type: 'zstr' },
  { name: 'lc_numeric', type: 'zstr' },
  { name: 'lc_time', type: 'zstr' },
  { name: 'lc_all', type: 'zstr' },
  { name: 'dev', type: 'zstr' },
  { name: 'browse_caps', type: 'zstr' },
  { name: 'protocol', type: 'zstr' }
]

const error_enum = [
  { name: 'x', type: 'nil' },
  { name: 'errno', type: 'int32' },
  { name: 'errstr', type: 'zstr' }
]

const parse_enum = {
  info: info_enum,
  file: file_enum,
  error: error_enum
}

const config = {
  ssh: {
    host: 'demo.asperasoft.com',
    port: 33001,
    username: 'aspera',
    password: 'demoaspera',
  },
  cmd: 'as_ls /',
  loglevel: 'info'
}

/**************************************************************/
/*                      Main                                  */
/**************************************************************/
log.level = config.loglevel

var data_buffer = Buffer.alloc(0)
var cmdValue = ''

// cli options
program
  .description('execute ascmd with the given cmd (default: as_ls / ) on remote host (ssh) and parse the output\nw/o any options it just calls: "as_ls /" on demo.asperasoft.com')
  .option('--host <string>', 'hostname')
  .option('--port <int>', 'port', parseInt, 33001)
  .option('--user <string>', 'username')
  .option('--pass <string>', 'password')
  .option('-v, --verbose', 'log verbose')
  .option('-j, --json <object>', 'json object for options')
  .arguments('[cmd]')
  .action(function(cmd) { cmdValue = cmd })
  .version(packagejson.version, '--version')
  .parse(process.argv)

if (typeof cmdValue !== 'undefined') {
  config.cmd = cmdValue
}
if (program.host) {
  config.ssh.host = program.host
}
if (program.user) {
  config.ssh.user = program.user
}
if (program.pass) {
  config.ssh.pass = program.pass
}
if (program.port) {
  config.ssh.port = program.port
}
if (program.json) {
  // try {
  const configjson = JSON.parse(program.json)
  Object.assign(config, configjson)
  //}
  // catch (err) {
  //   log.error('main', 'error parsing JSON: ' + program.json)
  //   process.exit(1)
  // }
}

if (program.verbose) {
  log.level = 'verbose'
  config.loglevel = 'verbose'
  log.verbose('main', 'Moin Moin from ascmdparse')
  log.verbose('main', 'options: ', program.opts())
  log.verbose('main', 'command: ', cmdValue)
}

log.notice('main', 'config:', config)

_callssh(config)

function _callssh(config) {
  const ssh = new SSH2Promise(config.ssh)
  ssh.spawn('ascmd').then(
    (socket) => {
      socket.write(config.cmd + '\n' + 'as_exit' + '\n')
      socket.on('data', (data) => { data_buffer = Buffer.concat([data_buffer, data]) })
      socket.on('exit', (exit) => {
        log.verbose('ssh', 'ssh Exit')
        log.verbose('ssh', data_buffer)
        ssh.close()
        _parse(data_buffer)
      })
    }, (err) => {
      log.error('ssh', err)
    }
  )
}

function _parse(data_buffer) {
  var output = {}
  output.files = []

  var results = bufList.parse(data_buffer).fieldList
  results.forEach(field => {
    // console.log(field)
    field['type'] = result_enum[field.index].name
    switch (field.type) {
      case 'info':
      case 'error':
        praseItems(field, field.type)
        output[field.type] = field
        break
      case 'file':
        praseItems(field, 'file')
        output.files.push(field)
        break
      case 'dir':
        var files = bufList.parse(field.data).fieldList
        files.forEach(file => {
          file['type'] = 'file'
          praseItems(file, 'file')
          output.files.push(file)
        })
        field.items = files
        break
      default:
        output[field.type] = 'Not yet supported!'
        break
    }
  })

  log.verbose('parse', require('util').inspect(results, { depth: null, colors: true }))
  delete output.info.data; delete output.info.len; delete output.info.index
  // delete output.error.data; delete output.error.len; delete output.error.index
  output.files.forEach(f => { delete f.data; delete f.len; delete f.index })
  log.verbose('output', require('util').inspect(output, { depth: null, colors: true }))
  log.info('output', 'info: ' + output.info.platform)
  log.info('output', 'files: ' + output.files.length)
  log.info('output', 'error: ' + (typeof output.error === 'undefined' ? '' : output.error.errstr))
}

function praseItems(buf, type) {
  var items = bufList.parse(buf.data).fieldList
  log.verbose('parse ' + type, require('util').inspect(items, { depth: null, colors: true }))
  items.forEach(i => {
    i['type'] = parse_enum[type][i.index].name
    var p_type = parse_enum[type][i.index].type
    i['value'] = itemParser[p_type].parse(i.data).val
    buf[i.type] = i.value
  })
  // buf.items = items
}

function json2s(obj) { return JSON.stringify(obj, null, 2) } // format JSON payload for log
function buf2decimal(buf) {
  var string = ''
  buf.forEach(i => { string += i + ' ' })
  return string
}

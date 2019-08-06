#!/usr/bin/env node
'use strict'

var SSH2Promise = require('ssh2-promise')

var fs = require('fs')
var wstream = fs.createWriteStream('data.binary')

var data_buf = Buffer.alloc(0)

var Parser = require('binary-parser').Parser

var field = new Parser()
  .int8('index')
  .int32be('len')
  .buffer('data', {
    length: 'len'
  })

var bufList = new Parser()
  .array('fieldList', {
    type: field,
    readUntil: 'eof'
  })

var itemParser = {}
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

const sshconfig_a = {
  host: 'eudemo.asperademo.com',
  port: 33001,
  username: 'aspera',
  password: 'demoaspera'
}

var ssh = new SSH2Promise(sshconfig_a)

ssh.spawn('ascmd').then(
  (socket) => {
    socket.on('data',
      (data) => {
        data_buf = Buffer.concat([data_buf, data])
      }
    )

    // socket.write('as_ls /\n')
    socket.write('as_ls /aspera-test-dir-tiny/200KB.80\n')
    socket.write('as_exit\n')

    socket.on('exit',
      (exit) => {
        ssh.close()
        // console.log(data_buf)
        wstream.write(data_buf)

        var results = bufList.parse(data_buf).fieldList

        results.forEach(field => {
          // console.log(field)
          field['type'] = result_enum[field.index].name
          switch (field.type) {
            case 'info':
              praseInfo(field)
              break
            case 'file':
              praseFile(field)
              break
            case 'dir':
              var files = bufList.parse(field.data).fieldList
              files.forEach(file => {
                praseFile(file)
              })
              field.data = files
              break
            default:
              break
          }
        })

        console.log(require('util').inspect(results, { depth: null, colors: true }))
      }
    )
  },
  (err) => {
    console.log("Something's wrong")
    console.log(err)
  }
)

function buf2decimal (buf) {
  var string = ''
  buf.forEach(i => { string += i + ' ' })
  return string
}
function json2s (obj) { return JSON.stringify(obj, null, 2) } // format JSON payload for log

function praseInfo (buf) {
  buf['type'] = 'info'
  var items = bufList.parse(buf.data).fieldList
  items.forEach(i => {
    i['type'] = info_enum[i.index].name
    var p_type = info_enum[i.index].type
    i['value'] = itemParser[p_type].parse(i.data).val
    buf[i.type] = i.value
  })
  // buf.data = items
}
function praseFile (file) {
  file['type'] = 'file'
  var items = bufList.parse(file.data).fieldList
  items.forEach(i => {
    i['type'] = file_enum[i.index].name
    var p_type = file_enum[i.index].type
    i['value'] = itemParser[p_type].parse(i.data).val
    file[i.type] = i.value
  })
  // file.data = items
}

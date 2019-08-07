## node.js based parser for Aspera ascmd  
[![Dependencies Status](https://david-dm.org/m67hoff/ascmdParser.svg)](https://david-dm.org/m67hoff/ascmdParser)

**currently under development - only testing the parser !**

A parse module for node.js to parse the Aspera ascmd binary return data, and convert it to a NodeAPI like JSON. 

### cli for testing:
```
Usage: ascmdparse [options] [cmd]

execute ascmd with the given cmd (default: as_ls / ) on remote host (ssh) and parse the output
w/o any options it just calls: "as_ls /" on demo.asperasoft.com

Options:
  --host <string>      hostname
  --port <int>         port (default: 33001)
  --user <string>      username
  --pass <string>      password
  -v, --verbose        log verbose
  -j, --json <object>  json object for options
  --version            output the version number
  -h, --help           output usage information

```



### Todo
- timeout the ssh call 
- NodeAPI JSON return
- callable functions  
- npm module
- ...
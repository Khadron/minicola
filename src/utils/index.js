const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isType(type) {
  return function (obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

const isObject = isType("Object")
const isString = isType("String")
const isArray = Array.isArray || isType("Array")
const isFunction = isType("Function")
const isUndefined = isType("Undefined")

module.exports = {
  formatTime: formatTime,
  isType,
  isObject,
  isString,
  isArray,
  isFunction,
  isUndefined
}

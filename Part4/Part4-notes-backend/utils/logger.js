const info = (...params) => {
    console.log(...params)
    // ... => “收集参数” + “展开参数”
  }
  
  const error = (...params) => {
    console.error(...params)
  }
  
  module.exports = { info, error }
  
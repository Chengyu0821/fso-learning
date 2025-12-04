import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  //调用后端/api/login 的post
  return response.data
}

export default { login }



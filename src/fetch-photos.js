import * as utils from './utils'

export default ({ q, page, limit = 20 }) => {
  const query = {
    key: process.env.API_KEY,
    q,
    page,
    per_page: limit,
  }

  return fetch(`https://pixabay.com/api/?${utils.encodeQuery(query)}`).then(x =>
    x.json()
  )
}

process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const server = require('../server')

describe('GET /', () => {
  it('should return json', done => {
    chai
      .request('http://localhost:3000/')
      .get('api/info/1')
      .end((err, response) => {
        should.not.exist(err)
        console.dir(response.res.body)
        done()
      })
  })
})

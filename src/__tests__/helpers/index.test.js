import API from '../../helpers/api'
import sinon from 'sinon'

describe('Helpers', () => {
  describe('API', () => {
    let context

    beforeEach(() => {
      const api = new API({
        url: 'http://your-host.com',
        version: 'v3',
      })

      context = {
        api,
        axiosRequest: sinon.stub(api.axios, 'request').resolves({
          data: {},
        }),
      }
    })

    test('create an instance', () => {
      expect(context.api).toBeInstanceOf(API)

      expect(
        Object.getOwnPropertyNames(Object.getPrototypeOf(context.api))
      ).toEqual([
        'constructor',
        'request',
        'find',
        'findOne',
        'create',
        'update',
        'delete',
      ])

      expect(Object.getOwnPropertyNames(context.api)).toEqual([
        'options',
        'axios',
      ])
    })

    test('axios request', async () => {
      await context.api.request('get', '/projects', {
        params: {
          sort_by: '-title',
        },
      })

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'get',
          url: '/projects',
          params: {
            sort_by: '-title',
          },
        })
      ).toBe(true)
    })

    test('find', async () => {
      await context.api.find('projects', {
        orderBy: '-title',
      })

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'get',
          url: '/projects',
          params: {
            orderBy: '-title',
          },
        })
      ).toBe(true)
    })

    test('findOne', async () => {
      await context.api.findOne('projects', 1)

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'get',
          url: '/projects/1',
        })
      ).toBe(true)
    })

    test('create', async () => {
      await context.api.create('projects', {
        title: 'First project ever',
      })

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'post',
          url: '/projects',
          data: {
            title: 'First project ever',
          },
        })
      ).toBe(true)
    })

    test('update', async () => {
      await context.api.update('projects', 1, {
        category: 'Operations',
      })

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'put',
          url: '/projects/1',
          data: {
            category: 'Operations',
          },
        })
      ).toBe(true)
    })

    test('delete', async () => {
      await context.api.delete('projects', 1)

      expect(
        context.axiosRequest.calledWithExactly({
          method: 'delete',
          url: '/projects/1',
        })
      ).toBe(true)
    })
  })
})

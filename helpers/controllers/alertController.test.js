jest.mock('../mattermost')
jest.mock('../../graphql/queryResolvers/alerts')
import { alerts } from '../../graphql/queryResolvers/alerts'
import { prisma } from '../../prisma'
import { addAlert, removeAlert } from './alertController'

const mockAlerts = ['excuse me sir', 'did u just', 'turn into a potato?']
const context = {
  req: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    session: {},
    user: { isAdmin: true }
  }
}

alerts.mockResolvedValue(mockAlerts)
prisma.alert.create = jest.fn().mockImplementation(a => Promise.resolve(a))
prisma.alert.delete = jest.fn().mockImplementation(a => Promise.resolve(a))

describe('Alert controller tests', () => {
  let ctx

  const newAlert = {
    text: 'Set up your computer to submit challenges.',
    type: 'info',
    url:
      'https://www.notion.so/JS-0-Foundations-a43ca620e54945b2b620bcda5f3cf672#b45ed85a95e24c9d9fb784afb7a46bcc',
    urlCaption: 'View Instructions'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = { ...context }
  })

  test('Should add alert', async () => {
    expect(addAlert({}, newAlert, ctx)).resolves.toEqual(mockAlerts)
  })
  test('Should add alert with url and caption', async () => {
    expect(addAlert({}, newAlert, ctx)).resolves.toEqual(mockAlerts)
  })
  test('Should throw error if missing parameters', async () => {
    expect(
      addAlert({}, { url: 'https://google.com' }, ctx)
    ).rejects.toThrowError('Missing alert parameters')
  })

  test('Should remove alert', async () => {
    expect(removeAlert({}, { id: 5 }, ctx)).resolves.toEqual({ success: true })
  })
  test('Should throw error if no id provided when removing alert', async () => {
    prisma.alert.delete = jest
      .fn()
      .mockRejectedValueOnce('No alert id provided')
    expect(removeAlert({}, {}, ctx)).rejects.toThrowError(
      'No alert id provided'
    )
  })
  test('Should throw Error when user is not an admin when adding Alert', async () => {
    ctx.req.user.isAdmin = false
    expect(
      addAlert({}, { url: 'https://google.com' }, ctx)
    ).rejects.toThrowError('User is not an admin')
  })
  test('Should throw Error when user is not an admin when removing Alert', async () => {
    ctx.req.user.isAdmin = false
    expect(
      removeAlert({}, { url: 'https://google.com' }, ctx)
    ).rejects.toThrowError('User is not an admin')
  })
})

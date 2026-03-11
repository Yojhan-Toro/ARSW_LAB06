import * as mock from './apimock.js'
import * as client from './apiclientService.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const blueprintsService = useMock ? mock : client

export const { getAll, getByAuthor, getByAuthorAndName, create } = blueprintsService

export default blueprintsService

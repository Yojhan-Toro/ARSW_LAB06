import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAll, getByAuthor, getByAuthorAndName, create } from '../../services/blueprintsService.js'


export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const data = await getAll()

  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author, { rejectWithValue }) => {
    try {
      const data = await getByAuthor(author)
      return { author, items: data }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      const data = await getByAuthorAndName(author, name)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const createBlueprint = createAsyncThunk(
  'blueprints/createBlueprint',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await create(payload)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)


const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    authorStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrent(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })

      .addCase(fetchByAuthor.pending, (s) => {
        s.authorStatus = 'loading'
        s.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.authorStatus = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.authorStatus = 'failed'
        s.error = a.payload ?? a.error.message
      })

      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.error = a.payload ?? a.error.message
      })

      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) {
          s.byAuthor[bp.author].push(bp)
        }
      })
  },
})

export const { clearCurrent } = slice.actions
export default slice.reducer

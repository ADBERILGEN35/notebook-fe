import { useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'
import { useQuery } from '@tanstack/react-query'
import { notesQueries, type SearchNotesPayload } from '../services/noteService'

export const useNoteSearch = (initialQuery = '') => {
  const [searchParams, setSearchParams] = useState<SearchNotesPayload>({
    q: initialQuery,
    size: 10,
    sort: 'updated_at,desc'
  })

  const debouncedQuery = useDebounce(searchParams.q, 300)

  const effectiveParams = useMemo<SearchNotesPayload>(
    () => ({
      ...searchParams,
      q: debouncedQuery
    }),
    [searchParams, debouncedQuery]
  )

  const query = useQuery({
    ...notesQueries.search(effectiveParams),
    enabled: Boolean(effectiveParams.q && effectiveParams.q.trim().length >= 3),
    staleTime: 1000 * 30
  })

  return {
    searchParams,
    setSearchParams,
    query
  }
}



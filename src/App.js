import React from 'react';
import axios from 'axios';
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const queryClient = useQueryClient()
  const [intervalMs, setIntervalMs] = React.useState(1000)
  const [value, setValue] = React.useState('')

  const { status, data, error, isFetching } = useQuery(
    ['todos'],
    async () => {
      const res = await axios.get('/api/data')
      return res.data
    },
    {
      refetchInterval: intervalMs,
    },
  )

  const addMutation = useMutation((value) => fetch(`/api/data?add=${value}`), {
    onSuccess: () => queryClient.invalidateQueries(['todos']),
  })

  const clearMutation = useMutation(() => fetch(`/api/data?clear=1`), {
    onSuccess: () => queryClient.invalidateQueries(['todos']),
  })

  if (status === 'loading') return <h1>로딩중...</h1>
  if (status === 'error') return <span>에러: {error.message}</span>

  return (
    <div>
      <h1>만료 시간이 1초로 설정된 자동 리패치</h1>
      <label>
        Query Interval speed (ms):{' '}
        <input
          value={intervalMs}
          onChange={(ev) => setIntervalMs(Number(ev.target.value))}
          type="number"
          step="100"
        />{' '}
        <span
          style={{
            display: 'inline-block',
            marginLeft: '.5rem',
            width: 10,
            height: 10,
            background: isFetching ? 'green' : 'transparent',
            transition: !isFetching ? 'all .3s ease' : 'none',
            borderRadius: '100%',
            transform: 'scale(2)',
          }}
        />
      </label>
      <h2>Todo List</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          addMutation.mutate(value, {
            onSuccess: () => {
              setValue('')
            },
          })
        }}
      >
        <input
          placeholder="enter something"
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
        />
      </form>
      <ul>
        {data.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => {
            clearMutation.mutate()
          }}
        >
          모두 지우기
        </button>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  )
}
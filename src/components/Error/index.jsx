import { Link } from 'react-router-dom'

const Error = () => {
  return (
    <div>
      <h2>Something went wrong</h2>
      <Link to="/">
        <button>Back to home</button>
      </Link>
    </div>
  )
}

export default Error

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Error } from './components'
import { HomePage } from './pages'
import './index.scss'

ReactDOM.render(
  <>
    <Router>
      <Routes>
        <Route exact path="/*" element={<HomePage />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  </>,
  document.getElementById('root')
)

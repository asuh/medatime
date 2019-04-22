import React, {
  useReducer,
} from 'react'
import PropTypes from 'prop-types'

import timerReducer from './reducer'

export const TimerContext = React.createContext(null)

const TimerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timerReducer, {})

  return (
    <TimerContext.Provider
      value={{ state, dispatch }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export default TimerProvider

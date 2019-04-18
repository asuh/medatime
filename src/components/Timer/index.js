import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Digit from '../Digit'
import TimerControlButton from '../TimerControlButton'
import TimerRestartButton from '../TimerRestartButton'
import TimerProgressBar from '../TimerProgressBar'
import Sound from '../Sound'
import { withPrefix } from 'gatsby'

class Timer extends React.Component {
	constructor(props) {
    super(props)

    const { startingTimeInMilliseconds } = props
    const startingTimeString = this.getTimeStringFrom(startingTimeInMilliseconds, Date)

    this.state = this.mapTimeStringToStateObject(startingTimeString, Number)
    this.state.totalSeconds = startingTimeInMilliseconds
  }

  mapTimeStringToStateObject = (timeString) => {
    const seconds = timeString.substr(6,2)
    const minutes = timeString.substr(3,2)
    const hours = timeString.substr(0,2)

    return {
      secondsOnes: Number(seconds[1]),
      secondsTens: Number(seconds[0]),
      minutesOnes: Number(minutes[1]),
      minutesTens: Number(minutes[0]),
      hoursOnes: Number(hours[1]),
      hoursTens: Number(hours[0])
    }
  }

  getTimeStringFrom = (seconds, dateObject) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setMilliseconds(seconds)

    return date.toTimeString().substr(0,8)
  }

  checkTime = (time) => {
    return time === 0 || time < 0
  }

  returnStopClock = (callback, context, timerId) => {
    return callback.bind(context, timerId)
  }

  updateDigitsState = () => {
    const currentSeconds = this.state.totalSeconds
    const timeString = this.getTimeStringFrom(currentSeconds, Date)
    const isOutOfTime = this.checkTime(currentSeconds)

    if (isOutOfTime) {
      this.stopClock()
    }

    this.setState(this.mapTimeStringToStateObject(timeString, Number))
  }

  startClock() {
    this.stopClockCallback = this.returnStopClock(clearInterval, window, setInterval(() => {
      this.setState({
        totalSeconds: this.state.totalSeconds - 1000
      }, this.updateDigitsState)
    }, 1000))
  }

  stopClock() {
    this.stopClockCallback()
  }

  restartClock() {
    const { startingTimeInMilliseconds } = this.props
    this.setState({
      totalSeconds: startingTimeInMilliseconds
    }, this.updateDigitsState)
  }

  componentDidMount() {
    const { startingTimeInMilliseconds } = this.props
    if (this.checkTime(startingTimeInMilliseconds))
      return
    this.startClock()
  }

  componentWillUnmount() {
    if ('stopClock' in this) this.stopClock()
  }

  render() {
    const {
      secondsOnes,
      secondsTens,
      minutesOnes,
      minutesTens,
      hoursOnes,
      hoursTens,
    } = this.state

    return (
      <React.Fragment>
        <h1>Timer</h1>
        <div className="Timer-digits">
          <Digit digit={hoursTens} />
          <Digit digit={hoursOnes} />
          <Digit digit={minutesTens} />
          <Digit digit={minutesOnes} />
          <Digit digit={secondsTens} />
          <Digit digit={secondsOnes} />
				</div>
        <TimerProgressBar
          totalSeconds={this.props.startingTimeInMilliseconds}
          remainingSeconds={this.state.totalSeconds}
        />
        <TimerControlButton
          isPlay
          playCallback={this.startClock.bind(this)}
          pauseCallback={this.stopClock.bind(this)}
        />
				<TimerRestartButton restartCallback={this.restartClock.bind(this)} />
        {this.state.totalSeconds === 0
          && (<Sound src={withPrefix('/static/medatime-finish.mp3')} />)}
      </React.Fragment>
    )
  }
}

Timer.propTypes = {
  startingTimeInMilliseconds: PropTypes.number.isRequired,
}

export default Timer
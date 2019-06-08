import React from 'react'
import Interact from 'interactjs'
import cn from 'classnames'
import './index.styl'

class RadialControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      squareCoord: {
        x: 400,
        y: 180,
      },
      isSelected: true,
    }
  }

  constrainPointToRadius(origin, destination, radius) {
    /* First get vector from destination and origin
     * Then get unit vector
     * then add radius to unit vector
     */

    const vector = {
      x: destination.x - origin.x,
      y: destination.y - origin.y
    }
    const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
    const unitVector = {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    }

    const newDestination = {
      x: radius * unitVector.x,
      y: radius * unitVector.y
    }

    return newDestination
  }

  getDegreesFromPoint(point) {
    return Math.atan(point.y / point.x) * 180 / Math.PI
  }

  onMove(event) {
    const {
      squareCoord,
      originPoint,
      isSelected
    } = this.state
    const target = event.target

    if (!isSelected) return

    const destinationPoint = {
      x: squareCoord.x + event.dx,
      y: squareCoord.y + event.dy
    }

    // percentage out of 360 degrees
    const percentage = this.convertDegreesToPercentage(
      this.getDegreesFromPoint2(destinationPoint)
    )

    // prevent square coords from going beyond 100% or 0%
    // Also constrains the squares coordinates to the radius
    const adjustedPoint = this.constrainSquareCoord(
      percentage,
      this.constrainPointToRadius(
        originPoint,
        destinationPoint,
        this.props.radius,
      )
    )

    // If the draggable event coords
    // match the squareCoords don't do any work
    if (adjustedPoint.x === squareCoord.x
      && adjustedPoint.y === squareCoord.y)
      return

    const deg = this.getDegreesFromPoint(adjustedPoint)
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + adjustedPoint.x + 'px, ' + adjustedPoint.y + 'px) rotate('+ deg + 'deg) '


    this.setState({
      squareCoord: destinationPoint,
      percentage,
    })
  }

  getStrokeDashFrom(percentage, radius) {
    const circumference = Math.PI * (radius * 2)

    return `${((100 - percentage) / 100) * circumference}px`
  }

  getDegreesFromPoint2(point) {
    const { originPoint } = this.state

    const deltaX = point.x - originPoint.x
    const deltaY = point.y - originPoint.y
    const radians = Math.atan2(deltaY, deltaX)

    return radians * (180 / Math.PI)
  }

  convertDegreesToPercentage(degrees) {
    if (degrees < 0)
      degrees = -1 * degrees
    else
      degrees = 180 - degrees + 180

    const percentage = degrees / 360 * 100

    if (percentage <= 0.5)
      return 0
    else
      return Math.ceil(percentage)
  }

  constrainSquareCoord(curPercentage, newControlPoint) {
    // constrains the square control from dragging beyond
    // 100% or 0%
    const prevPercentage = this.state.percentage

    if ((prevPercentage >= 95
      && curPercentage <= 5)
      || (prevPercentage <= 5
      && curPercentage >= 95)) {
      return this.state.squareCoord // previous square coords
    }

    return newControlPoint
  }

  componentDidMount() {
    const originRect = this.circle.getBoundingClientRect()
    const originPoint = {
      x: originRect.x + originRect.width / 2,
      y: originRect.y + originRect.height / 2,
    }
    const squareCoord =  {
      x: originPoint.x + this.props.radius,
      y: originPoint.y - 1,
    }


    this.setState({
      originPoint,
      squareCoord,
    }, () => {
      const eventObject = {
        target: this.square,
        dx: 0,
        dy: 0,
      }

      this.onMove(eventObject)
    })

    Interact(this.square)
      .draggable({
        onstart: (event) => {
          //console.log('start event: ', event.speed)
        },
        onmove: this.onMove.bind(this),
        onend: (event) => {
          //console.log('end event: ', event.speed)
        },
      })
  }

  componentDidUpdate(prevProps, prevState) {
    const { percentage } = this.state
    const { percentage: oldPercentage } = prevState
    const { onChange } = this.props

    if (oldPercentage !== undefined
      && percentage !== undefined
      && oldPercentage !== percentage
      && typeof onChange === 'function'
    ) {
      onChange(percentage)
    }
  }

  radialOnMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const { onMouseDown } = this.props

    this.setState({ isSelected: true })
    onMouseDown()
  }

  radialOnMouseUp = () => {
    const { onMouseUp } = this.props

    this.setState({ isSelected: false })
    onMouseUp()
  }

  render() {
    const {
      children,
      radius,
    } = this.props

    const height = radius * 2 + 4
    const width = height

    return (
      <div className='RadialControl' style={{ height, width }}>
      <svg
        className='RadialControl-circle-container'
        height={height}
        width={width}
        xmlns='http://www.w3.org/2000/svg'>
          <circle
            className='RadialControl-circle RadialControl-circle-background'
            ref={ (el) => this.circle = el}
            cx='50%'
            cy='50%'
            r={radius}
            strokeDasharray={this.getStrokeDashFrom(0, radius)}
            strokeDashoffset={0}
            fill='none'
          />
          <circle
            className='RadialControl-circle'
            cx='50%'
            cy='50%'
            r={radius}
            strokeDasharray={this.getStrokeDashFrom(0, radius)}
            strokeDashoffset={this.getStrokeDashFrom(this.state.percentage, radius)}
            fill='none'
          />
        </svg>
        <div
          className={cn(
            'RadialControl-knob',
            'RadialControl-knob-circle',
          )}
          onMouseDown={this.radialOnMouseDown}
          onMouseUp={this.radialOnMouseUp}
          onMouseOut={this.radialOnMouseUp}
          ref={ (el) => this.square = el }
         >
        </div>
        <div className='RadialControl-children'>
         { children }
         </div>
      </div>
    )
  }
}

export default RadialControl

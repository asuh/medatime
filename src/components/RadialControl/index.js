import React from 'react'
import Interact from 'interactjs'
import './index.styl'

class RadialControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      controlPoint: {
        x: 100,
        y: 100
      }
    }

  }

  constraintPointToRadius(origin, destination) {
    /* First get vector from destination and origin
     * Then get unit vector
     * then add radious to unit vector
     *
     */
    const destRadius = -10

    const vector = {
      x: destination.x - origin.x,
      y: destination.y - origin.y
    }
    const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
    const unitVector = {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    }

    //const newDestination = {
      //x: (destination.x + destRadius) * unitVector.x,
      //y: (destination.y + destRadius) * unitVector.y
    //}
    const newDestination = {
      x: 100 * unitVector.x,
      y: 100 * unitVector.y
    }

    return newDestination
  }


  onMove(event) {
    const target = event.target
    const controlPoint = this.state.controlPoint
    const originPoint = {
      x: 100,
      y: 100
    }

    const destinationPoint = {
      x: controlPoint.x + event.dx,
      y: controlPoint.y + event.dy
    }

    const adjustedPoint = this.constraintPointToRadius(
      originPoint,
      destinationPoint
    )
    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + adjustedPoint.x + 'px, ' + adjustedPoint.y + 'px)';

    this.setState({
      controlPoint: destinationPoint
    })
  }

  componentDidMount() {
    Interact(this.square)
      .draggable({
        onmove: this.onMove.bind(this),
      })
  }

  render() {
    return (
      <div
        className='RadialControl-square'
        ref={ (el) => this.square = el }
       >
      </div>
    )
  }
}

export default RadialControl

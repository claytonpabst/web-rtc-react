import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import Peer from 'simple-peer';

class App extends Component {
  constructor() {
    super()
    this.state = {
      message: '',
      room: '',
      whatIsHappening: ''
    }
    this.initiator = false
    this.myIpData = {}
  }

  componentDidMount() {
    this.setSocketListeners()
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  setSocketListeners = () => {
    console.log('sockets')
    this.socket = io()

    this.socket.on('call peer', (data) => {
      if (!this.initiator) {
        this.setState({ whatIsHappening: "Someone is calling you!" })
        this.gettingCall(data.ipObj)
      }
    })
    this.socket.on('answer peer', (data) => {
      if (this.initiator) {
        this.setState({ whatIsHappening: 'The other party answered your call!' })
        this.gettingAnswer(data.ipObj)
      }
    })
  }

  joinRoom = () => {
    this.socket.emit("joinRoom", this.state.room)
  }

  setRtcListeners = () => {
    this.rtc.on('error', function (err) { console.log('error', err) })

    this.rtc.on('connect', () => {
      console.log('CONNECT')
      this.rtc.send('whatever' + Math.random())
    })

    this.rtc.on('data', (data) => {
      console.log(""+data)
      this.setState({whatIsHappening: ""+data})
    })

    this.rtc.on('stream', function (stream) {
      var video = document.querySelector('video')
      video.srcObject = stream
      video.play()
    })
  }

  call = () => {
    this.initiator = true
    navigator.getUserMedia({ video: true, audio: true }, this.gotMediaForCall, function () { })
  }
  
  gettingCall = (ipObj) => {
    navigator.getUserMedia({video:true, audio:true}, (stream) => this.gotMediaAfterBeingCalled(stream, ipObj), function(){})
  }

  answer = () => {
    this.socket.emit('answer peer', { room:this.state.room, initiator:this.initiator, ipObj:JSON.stringify(this.myIpData)})
  }

  gettingAnswer = (ipObj) => {
    this.rtc.signal(ipObj)
  }

  gotMediaForCall = (stream) => {
    this.rtc = new Peer({ initiator: this.initiator, trickle: false, stream: stream })

    this.rtc.on('signal', (data) => {
      this.myIpData = data
      this.socket.emit('call peer', { room:this.state.room, initiator: this.initiator, ipObj: JSON.stringify(this.myIpData) })
    })

    this.setRtcListeners()
  }

  gotMediaAfterBeingCalled = (stream, ipObj) => {
    this.rtc = new Peer({ initiator: this.initiator, trickle:false, stream:stream })
  
    this.rtc.on('signal', (data) => {
      if(data.renegotiate){return}
      this.myIpData = data
    })

    this.rtc.signal(JSON.parse(ipObj))
  
    this.setRtcListeners()
  }

  sendMessage = () => {
    this.rtc.send(this.state.message)
  }

  render() {
    return (
      <div className="App">
        <p>{this.state.whatIsHappening}</p>
        <input onChange={(e) => this.setState({ room: e.target.value })} placeholder="room" />
        <button onClick={this.joinRoom}>Join Room</button>
        <button onClick={this.call}>Call</button>
        <button onClick={this.answer}>Answer</button>
        <video></video>
        <input onChange={(e) => this.setState({message: e.target.value})}/>
        <button onClick={this.sendMessage}>Send Message</button>
      </div>
    );
  }
}

export default App;

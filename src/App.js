import React, { Component } from 'react';
import logo from './header-logo.png';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Detector } from "react-detect-offline";
import FloatingLabelInput from 'react-floating-label-input';
import Sound from 'react-sound';

const __DEV__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
const offlineStyle = { position: 'absolute', top: 0, alignSelf: 'center', left: 0, right: 0, height: 50, backgroundColor: 'red', color: 'white', alignItems: 'center', justifyContent: 'center' }
const log = (msg) => {
  if (__DEV__) console.log(msg)
}
class App extends Component {
  state = {
    data: [],
    isSoundAlert: false,
    eventID: 'tmone'
  }
  constructor(p) {
    super(p)
    this.getDataFromApi()
  }

  ws
  listenToWS = () => {
    log("reconnect to websocket")
    const loc = window.location;
    let uri = 'ws:';

    if (loc.protocol === 'https:') {
      uri = 'wss:';
    }
    uri += '//' + loc.host;
    uri += loc.pathname + 'ws';

    uri += "/listen"

    this.ws = new WebSocket(__DEV__ ? 'ws://localhost:1323/listen' : uri)
    // ws = new WebSocket(uri)

    this.ws.onopen = () => {
      log('Connected')
      this.getDataFromApi()
    }

    this.ws.onmessage = (evt) => {
      if (evt.data === 'refreshLeaderboard') {
        this.getDataFromApi()
      }
    }

    // setInterval( ()=> {
    //   this.ws.send('Hello, Server!');
    // }, 1000);
  }

  getDataFromApi = () => {
    log('restart websocket')
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status === 200) {
        let data = JSON.parse(request.responseText)
        data = data.sort((a, b) => b.point - a.point)
        this.setState({ data, isSoundAlert: true })
        toast.dismiss();
        toast.success("Table refreshed !", {
          position: toast.POSITION.BOTTOM_RIGHT,
          // pauseOnFocusLoss: true
        });
      } else {
        toast.dismiss();
        this.setState({ isSoundAlert: true })

        toast.error("Cannot get data", {
          position: toast.POSITION.BOTTOM_RIGHT,
          // pauseOnFocusLoss: true
        });

        if (this.isOnline) {
          this.getDataFromApi()
        }
      }
    };

    request.open('GET', (__DEV__ ? 'http://localhost:1323' : '') + '/user_with_most_chop?event_id=' + this.state.eventID);
    request.send();
  }
  isOnline = false
  setConnectivityStatus = (isOnline) => {
    log('system is ' + (isOnline ? 'online' : 'offline'))

    if (!this.isOnline && isOnline) {
      this.listenToWS()
    }
    this.isOnline = isOnline
  }
  render() {
    return (
      <>
        {
          this.state.isSoundAlert && <Sound
            url={__DEV__ ? "pop.mp3" : "https://fattahmuhyiddeen.github.io/react-leaderboard/pop.mp3"}
            autoLoad
            ignoreMobileRestrictions
            playStatus={Sound.status.PLAYING}
            playFromPosition={0 /* in milliseconds */}
            // onLoading={this.handleSongLoading}
            // onPlaying={this.handleSongPlaying}
            onFinishedPlaying={() => this.setState({ isSoundAlert: false })}
          />
        }
        <Detector polling={{ url: (__DEV__ ? 'http://localhost:1323' : '') + '/timestamp', enabled: true }} render={({ online: isOnline }) => {
          this.setConnectivityStatus(isOnline)
          if (isOnline) return false
          return <div style={offlineStyle}> Opps, you are offline</div>
        }} />
        <div className="App">
          <header className="App-header" >
            <img className="logo" src={logo} alt="logo" />
            <div className="table-container">
              <div className="table-title">TM ONE Convention 2019 Leaderboard</div>
              {/* <table>
              <tbody>
                <tr>
                  <td>
                    <img src={logo} className="App-logo" alt="logo" />
                  </td>
                  <td>
                    <FloatingLabelInput
                      id="example-3"
                      label="Event ID"
                      refs={c => this.eventIDtextinput = c}
                      onChange={() => this.setState({ eventID: this.eventIDtextinput.value }, this.getDataFromApi)}
                      value={this.state.eventID}
                    />
                  </td>
                </tr>
              </tbody>
              <br />
              <br />
              <br />
            </table> */}
              <table>
                <tbody>
                  <tr>
                    <th className="tableHeader">Rank #</th>
                    {__DEV__ && <th>User ID</th>}
                    <th>Name</th>
                    <th>Points</th>
                  </tr>
                  {this.state.data.map((item, index) => {
                    return (
                      <tr key={index} id={`row${index}-`} className="table-row">
                        <td id={`cell${index}-{index1}`}>{index + 1}</td>
                        {__DEV__ && <td id={`cell${index}-{index1_a}`}>{item.user_id}</td>}
                        <td id={`cell${index}-{index2}`}>{item.user_name}<br /><i><div className="email">{item.user_email}</div></i></td>
                        <td id={`cell${index}-{index3}`}>{item.point}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </header>

          <ToastContainer
          // pauseOnFocusLoss={true} 
          />
        </div>
      </>
    );
  }
}

export default App;

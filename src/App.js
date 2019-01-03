import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Detector } from "react-detect-offline";
import Sound from 'react-sound';

const __DEV__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

class App extends Component {
  state = {
    data: [],
    isSoundAlert: false
  }
  constructor(p) {
    super(p)
    this.getDataFromApi()
    setInterval(this.getDataFromApi, 10000)
  }

  getDataFromApi = () => {
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
          pauseOnFocusLoss: true
        });
      } else {
        toast.dismiss();
        this.setState({ isSoundAlert: true })

        toast.error("Cannot get data", {
          position: toast.POSITION.BOTTOM_RIGHT,
          pauseOnFocusLoss: true
        });
      }
    };

    request.open('GET', (__DEV__ ? 'http://localhost:1323' : '') + '/user_with_most_chop');
    request.send();
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
        <Detector polling={{ url: (__DEV__ ? 'https://api.rewards.nexlife.com.my' : '') + '/timestamp', enabled: true }} render={({ online: isOnline }) => {
          if (isOnline) return false
          return <div style={{ position: 'absolute', top: 0, alignSelf: 'center', left: 0, right: 0, height: 50, backgroundColor: 'red', color: 'white', alignItems: 'center', justifyContent: 'center' }}> Opps, you are offline</div>
        }} />
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />

            <table>
              <tbody>
                <tr>
                  <th className="tableHeader">Rank #</th>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
                {this.state.data.map((item, index) => {
                  return (
                    <tr key={index} id={`row${index}`}>
                      <td id={`cell${index}-{index1}`}>{index + 1}</td>
                      <td id={`cell${index}-{index2}`}>{item.user_name}</td>
                      <td id={`cell${index}-{index3}`}>{item.point}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </header>

          <ToastContainer pauseOnFocusLoss={true} />
        </div>
      </>
    );
  }
}

export default App;

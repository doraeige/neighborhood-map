import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react'
import './App.css';
import MapContainer from './MapContainer'
// import place from "./place"
// import axios from 'axios'

class App extends Component {

  render() {
    return (
      <div>
        <a className="menu" tabIndex="0">
          <svg className="hamburger-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z"/>
          </svg>
        </a>
        
        <MapContainer google={this.props.google} />
      </div>
    );
  }
}

class LoadingContainer extends Component {
    state = {
        content: '加载中...'
    }
    componentDidMount(){
        this.timer = setTimeout(() => {
            this.setState({content: '加载超时，请检查网络！'}); 
        }, 5000);
    }
    componentWillUnmount(){
        // 清除计时器
        clearTimeout(this.timer);
    }
    render(){
        return (
            this.state.content
        )
    }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCKDmRc5qFNvlWSkzC9kIrFd6TgkbTVsIo',
  LoadingContainer: LoadingContainer
})(App)



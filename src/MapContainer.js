import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import place from './place'
import axios from 'axios'

export default class MapContainer extends Component {

  state = {
    locations: place,
    query: '',
    markers: [],
    infowindow: new this.props.google.maps.InfoWindow(),
    highlightedIcon: null
  }
 
  componentDidMount() {
    this.loadMap()
    this.onclickLocation()
    // Create a "highlighted location" shops color for when the user
    // clicks on the shops.
    this.setState({highlightedIcon: this.makeMarkerIcon('FFFF24')})
  }

  getWeatherInfo(city) {
    return axios.get(`https://free-api.heweather.com/s6/weather/now?&location=${city}&key=1e3ce063c27d48c3835a0fd6136b6cac`)
      .then(res => {
        let data = res.data
        let weather_txt = data.HeWeather6[0].now.cond_txt
        return weather_txt
      })
    }

  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props
      const maps = google.maps

      const mapRef = this.refs.map
      const node = ReactDOM.findDOMNode(mapRef)

      const mapConfig = Object.assign({}, {
        center: {
          lat: 28.1864215531,
          lng: 112.9517913196
        },
        zoom: 12,
        mapTypeId: 'roadmap'
      })

      this.map = new maps.Map(node, mapConfig)
      this.addMarkers()
    }

  }

  // the public part code
  displayInfowindow = (e) => {
    const { infowindow } = this.state
    const { markers } = this.state
    const markerInd =
      markers.findIndex(m => m.title.toLowerCase() === e.target.innerText.toLowerCase())
    this.populateInfoWindow(markers[markerInd], infowindow)
  }

  onclickLocation = () => {
    const that = this
    document.querySelector('.locations-list').addEventListener('click', function (e) {
      if (e.target && e.target.nodeName === "LI") {
        that.displayInfowindow(e) 
      }
    })
  }

  handleValueChange = (e) => {
    this.setState({query: e.target.value})
  }

  addMarkers = () => {
    const {google} = this.props
    let {infowindow} = this.state
    const bounds = new google.maps.LatLngBounds()

    this.state.locations.forEach((location, ind) => {
      const marker = new google.maps.Marker({
        position: {lat: location.location.lat, lng: location.location.lng},
        map: this.map,
        title: location.name
      })

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, infowindow)
      })
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }))
      bounds.extend(marker.position)
    })
    this.map.fitBounds(bounds)
  }
  
  populateInfoWindow = (marker, infowindow) => {
    const defaultIcon = marker.getIcon()
    const {highlightedIcon, markers} = this.state

    
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {

      // reset the color of previous marker
      if (infowindow.marker) {
        const ind = markers.findIndex(m => m.title === infowindow.marker.title)
        markers[ind].setIcon(defaultIcon)
      }
      // change marker icon color of clicked marker
      marker.setIcon(highlightedIcon)
      infowindow.marker = marker

      this.getWeatherInfo(`长沙`).then((value) => {
        // console.log(value)
        infowindow.setContent(`<h3>${marker.title}</h3><h4>weather: ${value}</h4>`)
      }).catch(err => {
        infowindow.setContent(`抱歉！暂时无法获取天气信息。:)`)
      })
      
      infowindow.open(this.map, marker)

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
        // Restore marker icon color of the clicked marker
        infowindow.marker = null
        marker.setIcon(defaultIcon)
      })
    }
    // })
  }

  makeMarkerIcon = (markerColor) => {
    const {google} = this.props
    let markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }

  render() {
    const {locations, query, markers, infowindow} = this.state
    if (query) {
      locations.forEach((l, i) => {
        if (l.name.toLowerCase().includes(query.toLowerCase())) {
          markers[i].setVisible(true)
        } else {
          if (infowindow.marker === markers[i]) {
            // close the info window if marker removed
            infowindow.close()
          }
          markers[i].setVisible(false)
        }
      })
    } else {
      locations.forEach((l, i) => {
        if (markers.length && markers[i]) {
          markers[i].setVisible(true)
        }
      })
    }
    return (
      <div>
        <div className="container">
          <div className="text-input">
            <input role="search" type='text'
                   aria-label="Search"
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
            <ul className="locations-list">
            {
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i}
                     tabIndex="0"
                     role="button"
                     onKeyPress={ (evt) => {
                       // 如果用户按下空格键或回车键，则打开对应的 infowindow
                       if (evt.key === " " || evt.key === "Enter") {
                         this.displayInfowindow(evt)
                       }
                     }}
                  >{m.title}</li>))
            }</ul>
          </div>
          <div role="application" className="map" ref="map">
            loading map...
          </div>
        </div>
      </div>
    )
  }
}
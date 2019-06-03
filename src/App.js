import React from 'react';
import ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import logo from './MYLOGO.png'; // 
import {
  Input,
} from 'reactstrap';
import {
  Container, Col, Row,
  Navbar, Nav, FormControl, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, CardLink, Button, ListGroup, ListGroupItem, CardDeck, Form, ButtonGroup
} from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination'
import './App.css';
import InputRange from 'react-input-range';
import Modal from 'react-modal'
import YouTube from '@u-wave/react-youtube';

const apiKey = "e5a2bd4d03c2edeb1d954228dcf47ffd";
var moment = require('moment');

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      movies: [],
      page: 1,
      searchInput: '',
      allMovies: [],
      source: 'popular',
      genresList: [],
      countTags: 0,
      year: { min: '', max: '' },
      value: { min: '', max: '' },
      isOpen: false,
      selectedMovieID: null
    }
    this.handleChange = this.handleChange.bind(this)
  }
  componentDidMount = () => {
    this.getMovie()
    this.getGenres()
  }
  //fetch data from api
  getMovie = () => {
    const { page, source, genre_ids } = this.state;
    const api = (`https://api.themoviedb.org/3/movie/${source}?api_key=${apiKey}&page=${page}`);
    fetch(api)
      .then(response => response.json())
      .then(data => {
        this.setState({
          allMovies: this.state.movies.concat(data.results),
          movies: data.results,
          page: page + 1,
          genres_ids: data.results.map(movie => movie.genre_ids),
        })
      })
      .catch(error => {
      })
  }
  //handle event change & submit
  handleChange(event) {
    this.setState({
      searchInput: event.target.value
    })
    //this part for search movie box with only typing
    const moviesResult = this.state.allMovies.filter(value => value.original_title.concat(value.overview).toLowerCase().includes(this.state.searchInput.toLowerCase()))
    if (moviesResult) {
      this.setState({
        movies: moviesResult
      })
    }
  }
  handleSubmit = (event) => {
    const moviesResult = this.state.allMovies.filter(value => value.original_title.concat(value.overview).toLowerCase().includes(this.state.searchInput.toLowerCase()))
    if (moviesResult) {
      this.setState({
        movies: moviesResult
      })
      event.preventDefault();
    }
  }
  handleSubmitSource = (event) => {
    const { name, value } = event.target
    this.setState({
      [name]: value
    }, this.getMovie())
    event.preventDefault();
  }
  rateHandleChange = () => {
    this.setState({
      movies: this.state.allMovies.filter(movie => movie.vote_average >= this.state.value.min && movie.vote_average <= this.state.value.max)
    })
  }
  yearHandleChange = () => {
    let minDate = this.state.year.min;
    let maxDate = this.state.year.max;
    // Now we need to find all movies, where their release date is between minDate and maxDate
    let movies = this.state.allMovies.filter(
      movie => {
        let movieYear = moment(movie.release_date).year();
        return movieYear > minDate && movieYear < maxDate
      }
    );
    this.setState({
      movies: movies
    });

    // this.setState({
    //   movies: this.state.allMovies.filter(movie => moment(movie.release_date).format('YYYY') >= this.state.value.min && moment(movie.release_date).format('YYYY') <= this.state.value.max)
    // })
  }
  //sort - search function
  getGenres = () => {
    const { genresList } = this.state
    const apigenres = (`https://api.themoviedb.org/3/genre/movie/list?api_key=e5a2bd4d03c2edeb1d954228dcf47ffd`);
    fetch(apigenres)
      .then(response => response.json())
      .then(data => {
        this.setState({
          genresList: data.genres
        })
      })
  }
  sortIdGenres = (id) => {
    let go = this.state.allMovies.filter(movie => movie.genre_ids.includes(id))
    let countTag = go.length
    this.setState({
      movies: go,
    })
    return countTag
  }
  getCountTag = (id) => {
    let sumTags = this.state.allMovies.filter(movie => movie.genre_ids.includes(id)).length
    return sumTags
  }
  sortByPopularity = () => {
    const { allMovies } = this.state;
    this.setState({
      movies: allMovies.sort((a, b) => a.popularity - b.popularity)
    })
  }
  sortByRate = () => {
    const { allMovies, movies } = this.state;
    this.setState({
      movies: allMovies.sort((a, b) => a.vote_average - b.vote_average)
    })
  }
  sortByName = () => {
    const { movies } = this.state;
    this.setState({
      movies: movies.sort((a, b) => a.original_title - b.original_title)
    })
  }
  renderGenres = () => {
    return this.state.genresList.map(value => {
      if (value.name) {
        return (
          <Button onClick={() => { this.sortIdGenres(value.id) }}> {value.name} {this.getCountTag(value.id)} </Button>
        )
      }
    })
  }
  renderMovie = () => {
    return this.state.movies.map(({ title, release_date, overview, poster_path, vote_average, popularity, genre_ids }) => {
      return (
        <CardDeck style={{ width: '18Prem' }}  >
          <Card border="primary" style={{ width: '18rem' }} >
            <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${poster_path}`} />
            <Card.Body>
              <Card.Title>{title}</Card.Title>
              <Card.Text>  Overview: {overview}</Card.Text>
            </Card.Body>
            <Button variant="primary">Go to Homepage</Button>
            <ListGroupItem>Release Date:{release_date}</ListGroupItem>
            <ListGroupItem><b>Vote average:</b> {vote_average}</ListGroupItem>
            <ListGroupItem> <b>Popularity:</b> {popularity}</ListGroupItem>
          </Card>
        </CardDeck>
      )
    })
  }
  renderAllMovie = () => {
    return this.state.allMovies.map((movie) => {
      return (
        <Card border="primary" style={{ width: '18rem' }} >
          <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />
          <Card.Body>
            <Card.Title>{movie.title}</Card.Title>
            <Card.Text>  Overview: {movie.overview}</Card.Text>
          </Card.Body>
          <Button variant="primary" onClick={() => this.onClickTrailer(movie.id)}><b>Watch Trailer</b></Button>
          <ListGroupItem><b>Release Date:</b> {movie.release_date}</ListGroupItem>
          <ListGroupItem><b>Vote average:</b> {movie.vote_average}</ListGroupItem>
          <ListGroupItem> <b>Popularity:</b> {movie.popularity}</ListGroupItem>
        </Card>
      )
    })
  }

  onClickTrailer = async (movieID) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieID}/videos?api_key=${apiKey}&language=en-US`)
    const { results } = await response.json()
    if (results.length > 0) {
      let item = results[Math.floor(Math.random()*results.length)]
      this.setState({
        isOpen: true,
        selectedMovieID: item.key
      })
    }
  }

  // api for movie vids
  // https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=<<api_key>>&language=en-US

  //render all here
  render() {
    if (this.state.allMovies.length > this.state.movies.length && this.state.movies.length < 20) {
      var renderAllmovies = this.renderMovie()
    } else {
      var renderAllmovies = this.renderAllMovie()
    }
    return (
      <Container style={{ backgroundColor: '#CCCCCC' }}>
        {/* Navbar */}
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={() => this.setState({ isOpen: false })}
        >
          <YouTube
            video={this.state.selectedMovieID}
            width="100%"
            height="100%"
          />
        </Modal>
        <Row className="mynav">
          <div className="Navbar">
            <Navbar bg="" variant="" >
              <Navbar.Brand href="#home"><img src={logo} /></Navbar.Brand>
              <Nav className="mr-auto">
                <ButtonGroup aria-label="Basic example">
                  <Button onClick={() => this.sortByPopularity()}>Sort Popularity</Button>
                  <Button onClick={() => this.sortByRate()}>Sort by Rating</Button>
                </ButtonGroup>
              </Nav>
              <Form onSubmit={this.handleSubmit}>
                <Input type="text" search="searchInput" onChange={this.handleChange} placeholder="search Here" ></Input>
              </Form>
            </Navbar>
          </div>
        </Row>
        <Row>
          <Col sm={2} className='mynavside'>
            <div>
              <select value={this.state.source} name="source" onChange={this.handleSubmitSource}>
                <option value="">-- List of trending movies --</option>
                <option value="top_rated">List of top-rated movies</option>
                <option value="upcoming">List of upcoming movies</option>
              </select>
              <Button className="" onClick={this.getMovie} >See more</Button>
            </div>
            <div>
              <p><b>Search by Rating</b></p>
              <InputRange
                maxValue={10} minValue={0} value={this.state.value} onChange={value => this.setState({ value }, this.rateHandleChange)} />
              <br />
              <p><b>Search by year</b></p>
              <b> <InputRange maxValue={2020} minValue={2000} value={this.state.year} onChange={year => this.setState({ year }, this.yearHandleChange)} /></b>
              <div className="wrap">
                <br />
                <ButtonGroup aria-label="Basic example" vertical>
                  {this.renderGenres()}
                </ButtonGroup>
              </div>
            </div>
          </Col>
          <Col sm={10} className="container-parent ">
            {renderAllmovies}
          </Col>
        </Row>
      </Container >)
  }
}

export default App;

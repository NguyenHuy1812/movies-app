import React from 'react';
import ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import {
  Input,
} from 'reactstrap';
import {
  Navbar, Nav, FormControl, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, CardLink, Button, ListGroup, ListGroupItem, CardDeck, Form, ButtonGroup,
} from 'react-bootstrap';
import './App.css';
import InputRange from 'react-input-range';
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
      genres_ids: [],
      genresList: [],
      countTags: 0,
      year: { min: '', max: '' },
      value: { min: '', max: '' },

    }
    this.handleChange = this.handleChange.bind(this)

  }
  componentDidMount = () => {
    this.getMovie()
    this.getGenres()
  }
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
  getMovie = () => {
    const { page, source, genre_ids } = this.state;
    const apiKey = "e5a2bd4d03c2edeb1d954228dcf47ffd";
    const api = (`https://api.themoviedb.org/3/movie/${source}?api_key=${apiKey}&page=${page}`);
    fetch(api)
      .then(response => response.json())
      .then(data => {
        console.log("data", data)
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

  handleSubmitSource = (event) => {
    const { name, value } = event.target
    this.setState({
      [name]: value
    }, this.getMovie())
    event.preventDefault();
  }
  sortByPopularity = () => {
    const { movies } = this.state;
    this.setState({
      movies: movies.sort((a, b) => a.popularity - b.popularity)
    })
  }
  sortByRate = () => {
    const { movies } = this.state;
    this.setState({
      movies: movies.sort((a, b) => a.vote_average - b.vote_average)
    })
  }
  sortByName = () => {
    const { movies } = this.state;
    this.setState({
      movies: movies.sort((a, b) => a.original_title - b.original_title)
    })
  }
  rateHandleChange = () => {
    this.setState({
      movies: this.state.allMovies.filter(movie => movie.vote_average >= this.state.value.min && movie.vote_average <= this.state.value.max)
    })
  }
  yearHandleChange = () => {
    console.log('handle');
    let minDate = this.state.year.min;
    let maxDate = this.state.year.max;
    console.log('searching between', minDate, maxDate);

    // Now we need to find all movies, where their release date is between minDate and maxDate
    let movies = this.state.allMovies.filter(
      movie => { 
        let movieYear = moment(movie.release_date).year();
        return movieYear > minDate && movieYear < maxDate }
    );
    this.setState({
      movies: movies
    });

    // this.setState({
    //   movies: this.state.allMovies.filter(movie => moment(movie.release_date).format('YYYY') >= this.state.value.min && moment(movie.release_date).format('YYYY') <= this.state.value.max)
    // })
  }
  renderMovie = () => {
    return this.state.movies.map(({ title, release_date, overview, poster_path, vote_average, popularity, genre_ids }) => {
      return (
        <div className="container-child">
          <CardDeck>

            <Card style={{ width: '18rem' }}>
              <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${poster_path}`} />
              <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>  Overview: {overview}</Card.Text>
                <Card.Text>   Popularity: {popularity}</Card.Text>
                <Button variant="primary">Go somewhere</Button>
                <ListGroupItem>Release Date: {release_date}</ListGroupItem>
                <ListGroupItem>Vote average: {vote_average}</ListGroupItem>
              </Card.Body>
            </Card>
          </CardDeck>

        </div>
      )
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

  renderGenres = () => {
    return this.state.genresList.map(value => {
      if (value.name) {
        return (
          <button onClick={() => { this.sortIdGenres(value.id) }}> {value.name} {this.getCountTag(value.id)} </button>
        )
      }
    })
  }

  render() {
    return <div className=' container message-box'>
      <div className="Navbar">
                <Navbar bg="dark" variant="dark">
                  <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                  <Nav className="mr-auto">
                    <Button onClick={this.sortByPopularity}>Sort Popularity</Button>
                    <Button onClick={() => this.sortByRate()}>Sort by Rating</Button>
                  </Nav>
                  <Form onSubmit={this.handleSubmit}>
                    <Input type="text" search="searchInput" onChange={this.handleChange} placeholder="search Here" ></Input>
                  </Form>

                </Navbar>
                <select value={this.state.source} name="source" onChange={this.handleSubmitSource}>
                  <option value="">-- List of trending movies --</option>
                  <option value="top_rated">List of top-rated movies</option>
                  <option value="upcoming">List of upcoming movies</option>
                </select>
                <Button className="" onClick={this.getMovie} >See more</Button>
      </div>
                <div>
                <p>Search by Rating</p>
                <InputRange
                  maxValue={10}
                  minValue={0}
                  value={this.state.value}
                  onChange={value => this.setState({ value }, this.rateHandleChange)}
                />
                <p>Search by year</p>
                <InputRange
                  maxValue={2020}
                  minValue={2000}
                  value={this.state.year}
                  onChange={year => this.setState({ year }, this.yearHandleChange)}
                />
                </div>
                <p className=" gendesButton">{this.renderGenres()}</p>
      <div className=" container-parent">
        {this.state.allMovies.length > this.state.movies.length}   {this.renderMovie()}
      </div >
    </div>
  }
}





export default App;

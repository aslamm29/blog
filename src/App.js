import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [start, setStart] = useState(0);
  const [count, setCount] = useState(30);
  const [hasMore, setHasMore] = useState(false);
  const [oddEvenFilter, setOddEvenFilter] = useState("All");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchIdResult, setSearchIdResult] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [toggle, setToggle] = useState(false);

  //Used to initially render data, ideally the length of the items returned from the api can be handled better using a backend controller
  useEffect(() => {
    axios({
      method: "get",
      url: `https://jsonplaceholder.typicode.com/photos`
    })
      .then(res => {
        let data = res.data.slice(start, count);
        setPosts(prevState => [...prevState, ...data]);
        setStart(start => start + 30);
        setCount(count => count + 30);
        setHasMore(true);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //concurrently fetches data as the user scrolls down the page
  const fetchData = (start, length) => {
    axios({
      method: "get",
      url: `https://jsonplaceholder.typicode.com/photos`
    })
      .then(res => {
        let data = res.data.slice(start, length);
        setPosts(prevState => [...prevState, ...data]);
        setStart(start + 30);
        setCount(count + 30);
        if (data.length === 0) {
          setHasMore(false);
        }
      })
      .catch(error => console.log(error));
  };

  //Handles the display message at the bottom of the page
  const displayMessage = () => {
    if (hasMore) {
      return <span className="display">Scroll Down for More Posts</span>;
    } else {
      return <span className="display">No more Posts to display</span>;
    }
  };

  //Handles the conditional render of the post depending on filters and scroll feature
  const displayPosts = () => {
    if (searchIdResult !== undefined && searchIdResult.length !== 0) {
      return (
        <div className="blog-container">
          <Post post={searchIdResult} />
        </div>
      );
    } else {
      return (
        <InfiniteScroll
          dataLength={posts.length}
          next={() => fetchData(start, count)}
          hasMore={hasMore}
          scrollThreshold={0.95}
          className="infinite-scroll"
        >
          {filteredData.map(post => (
            <Post key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      );
    }
  };

  //Handles any changes on the Filter elements
  const handleChange = event => {
    if (event.target.name === "searchId") {
      setSearchId(event.target.value);
    }
    if (event.target.name === "searchTitle") {
      setSearchTitle(event.target.value);
    }
    if (event.target.name === "oddEvenFilter") {
      setOddEvenFilter(event.target.value);
    }
    if (event.target.name === "toggle") {
      setToggle(event.target.checked);
    }
  };

  //Handles updates when there is a change in ID search
  useEffect(() => {
    axios({
      method: "get",
      url: `https://jsonplaceholder.typicode.com/photos`
    })
      .then(res => {
        let data = res.data.find(d => d.id == searchId);
        setSearchIdResult(data);
      })
      .catch(error => console.log(error));
  }, [searchId]);

  //Handles updates when there is a change in posts, Title & oddEvenFilter
  useEffect(() => {
    let filteredData = posts;

    if (searchTitle !== "") {
      filteredData = filteredData.filter(item => {
        return item.title
          .toLowerCase()
          .includes(searchTitle.toLowerCase().trim())
          ? item
          : "";
      });
    }
    if (oddEvenFilter === "Even") {
      filteredData = filteredData.filter(item => {
        return item.id % 2 === 0 ? item : "";
      });
    }
    if (oddEvenFilter === "Odd") {
      filteredData = filteredData.filter(item => {
        return item.id % 2 === 1 ? item : "";
      });
    }
    setFilteredData(filteredData);
  }, [posts, searchTitle, oddEvenFilter]);

  return (
    <section
      id="blog-section"
      style={!toggle ? { background: "#f9f8f6" } : { background: "black" }}
    >
      <div className="container">
        <div className="title">
          <h3>Fintros</h3>
          <h1>Daily Blog Posts</h1>
          <p>Interesting people sharing their thoughts</p>
        </div>
        <div className="filter">
          <h4>Apply a filter to your blog search today</h4>
          <select
            name="oddEvenFilter"
            className="numberFilter"
            onChange={handleChange}
          >
            <option value="All">All</option>
            <option value="Even">Even</option>
            <option value="Odd">Odd</option>
          </select>
          <input
            type="text"
            name="searchTitle"
            className="searchTitle"
            value={searchTitle}
            onChange={handleChange}
            placeholder="Search by Title"
          ></input>
          <input
            type="text"
            name="searchId"
            className="searchId"
            value={searchId}
            onChange={handleChange}
            placeholder="Search by ID number"
          ></input>
          <div className="toggle">
            <FormControlLabel
              control={
                <Switch
                  checked={toggle}
                  onChange={handleChange}
                  value="toggle"
                  color="primary"
                  name="toggle"
                />
              }
              label="Dark Mode"
            />
          </div>
        </div>
        {displayPosts()}
        <div className="message">{!searchIdResult ? displayMessage() : ""}</div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { Button } from "react-bootstrap";
import NewType from "./GetLeaderType";
import VoterImage from "./GetImage";
import GetData from "./GetData";
import "../App.css";
import GetTags from "./GetTags";
import GetFb from "./GetFb";
import GetUser from "./GetUser";
import { useNavigate } from "react-router-dom";
import GetLeader from "./GetLeader";
import GetWarded from "./GetWarded";
import Spinner from "react-bootstrap/Spinner";
import { getIp, getUserId } from "./Vars";
import AddTag from "./CustomTag";
import NewTag from "./NewTag";
import ReactPaginate from "react-paginate";
import ReactDOM from "react-dom";

import Badge from "react-bootstrap/Badge";

const Home = () => {
  const navigate = useNavigate();
  if (sessionStorage.length == 0) {
    navigate("/login");
  }

  // Access the value of user_id
  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;


  const [voters, setVoters] = useState([]);
  const [isPending, setisPending] = useState(false);

  const [tags, setTags] = useState();

  const [searchTag, setSearchTag] = useState("");

  var num = 1;

  //add useeffect for disabling searchbutton
  //add stop button to stop searching

  const handleSpanClick = (id) => {
    console.log(id);
    const win = window.open("/viewVoter?id=" + id + "", "_blank");
    win.focus();
  };

  const Search = () => {
    const [searchTxt, setSearchTxt] = useState("");
    const [isChecked, setIsChecked] = useState(false); // State for checkbox

    const handleSubmit = (event) => {
      event.preventDefault();
      if (!searchTxt) {
        alert("Input name to search...");
      } else {
        setisPending(true);

        if (isChecked) {
          fetch(getIp() + "/searchNoFb?searchTxt=" + searchTxt + "")
            .then((response) => response.json())
            .then((data) => [
              setVoters(data),
              setisPending(false),
              console.log(data),
            ])
            .catch((error) => console.error("Error on handleSearch: " + error));
        } else {
          fetch(getIp() + "/searchVoter?searchTxt=" + searchTxt + "")
            .then((response) => response.json())
            .then((data) => [
              setVoters(data),
              setisPending(false),
              console.log(data),
            ])
            .catch((error) => console.error("Error on handleSearch: " + error));
        }
      }
    };

    return (
      <>
        <h2 className="poppins-bold">Search</h2>
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3" style={{ width: "70vh" }}>
            <FormControl
              placeholder="Juan Dela Cruz, Barangay, Municipality"
              aria-label="Juan Dela Cruz, Barangay, Municipality"
              aria-describedby="basic-addon2"
              className="searchInput"
              id="searchTxt"
              autoComplete="on"
              onChange={(e) => setSearchTxt(e.target.value)}
              value={searchTxt}
              required
            />
            <Button
              variant="outline-default"
              id="button-addon2"
              type="submit"
              disabled={isPending} // Assuming isPending is defined elsewhere
            >
              <i className="bi bi-search"></i>
            </Button>
          </InputGroup>
          <Form.Check
            type="checkbox"
            label="No Facebook search"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
        </Form>
      </>
    );
  };

  function Items({ currentItems }) {
    return (
      <>
        {voters.length !== 0 && (
          <div className="result">Found {voters.length} record(s)..</div>
        )}
        <ul className="names mt-2">
          {currentItems &&
            currentItems.map((voters, index) => (
              <li className="names-list mb-3">
                <Row className="align-items-left">
                  {/* <Col lg={2}>
                  <VoterImage id={voters.v_id} picwidth={80} picheight={80} />
                </Col> */}
                  <Col lg={8}>
                    <div
                      className="poppins-bold nameLink"
                      onClick={() => handleSpanClick(voters.v_id)}
                    >
                      {voters.record_type === "NICL" ? (
                        <>
                          <span className="text-danger text-decoration-line-through">
                            {voters.fullname}{" "}
                          </span>
                        </>
                      ) : (
                        <>{voters.fullname} </>
                      )}
                      <small>
                        {voters.fb != "" && voters.fb[0].id != "" && <><i className="bi bi-facebook"></i></>}
                      </small>
                    </div>
                    <div className="details">
                      {voters.address}
                      {" | "}
                      {voters.bday}
                      {" | "}
                      <strong>{voters.age}</strong>

                      <div className="text-muted remarks poppins-light">
                        {voters.leader.map((item, key) => (
                          <>
                            <Badge
                              bg="primary"
                              style={{ marginRight: "10px" }}
                              data-toggle="tooltip"
                              title="Leader"
                            >
                              <i className="bi bi-person"></i>{" "}
                              {NewType(item.type)} {item.electionyear}
                            </Badge>
                          </>
                        ))}
                        {voters.warding.map((item, key) => (
                          <>
                            <Badge
                              bg="info"
                              style={{ marginRight: "10px" }}
                              data-toggle="tooltip"
                              title="Warding"
                            >
                              <i className="bi bi-person-check"></i>{" "}
                              {item.leader} {item.electionyear}
                            </Badge>
                          </>
                        ))}
                        {voters.remarks.map((item, key) => (
                          <>
                            <Badge
                              bg="secondary"
                              style={{ marginRight: "10px" }}
                              data-toggle="tooltip"
                              title="Tagging"
                            >
                              <i className="bi bi-tag"></i> {item.remarks_txt}
                            </Badge>
                          </>
                        ))}
                        {voters.remarks_add.map((item, key) => (
                          <>
                            <Badge
                              bg="danger"
                              style={{ marginRight: "10px" }}
                              data-toggle="tooltip"
                              title="Tagging"
                            >
                              <i className="bi bi-tag"></i> {item.remarks_txt}
                            </Badge>
                          </>
                        ))}

                        {voters.contact.map((item, key) => (
                          <>
                            <Badge
                              bg="info"
                              style={{ marginRight: "10px" }}
                              data-toggle="tooltip"
                              title="Contact #"
                            >
                              <i className="bi bi-phone"></i>{" "}
                              {item.contact_number}
                            </Badge>
                          </>
                        ))}
                      </div>
                    </div>
                    <NewTag id={voters.v_id} />
                  </Col>
                </Row>
              </li>
            ))}
        </ul>
      </>
    );
  }

  function PaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = voters.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(voters.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % voters.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
    return (
      <>
        <Items currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="<"
          renderOnZeroPageCount={null}
          className="flex-container paginate"
        />
      </>
    );
  }
  return (
    <>
      <Container className="py-5 poppins-regular">
        <Search />
        {!isPending ? (
          <PaginatedItems itemsPerPage={20} />
        ) : (
          <div className="mt-3">
            <Spinner animation="grow" />
          </div>
        )}
      </Container>
    </>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import NewType from "./GetLeaderType";
import "../App.css";

const Home = () => {
  const [searchTxt, setSearchTxt] = useState("");
  const [voters, setVoters] = useState([]);
  const [isPending, setisPending] = useState(false);

  const handleOnkeyUp = (event) => {
    setSearchTxt(event.target.value);
    //console.log("value is:", event.target.value);
  };

  const handleSpanClick = (id) => {
    console.log(id);

    //setID(id);
    // Toggle the modal visibility state
    //setModalVisible((prevVisible) => !prevVisible);
  };

  const handleSearch = async () => {
    setisPending(true);
    const search = {
      txt: searchTxt,
    };

    fetch("http://localhost:3002/searchVoter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(search),
    })
      .then((response) => response.json())
      .then((data) => [setVoters(data), setisPending(false), console.log(data)])
      .catch((error) => console.error("ERR" + error));
  };

  return (
    <>
      <Container className="py-5">
        <Row className="align-items-center justify-content-center">
          <Col xxl={6}>
            <h1 className="text-primary">Voter Lookup</h1>
            {/* <Form> */}
            <Row>
              <Col xxl={8}>
                <Form.Group className="mb-3 row" controlId="searchTxt">
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    size="lg"
                    className="searchInput"
                    value={searchTxt}
                    onChange={handleOnkeyUp}
                  />
                </Form.Group>
              </Col>
              <Col xxl={4}>
                <Button className="mb-3" onClick={handleSearch} size="lg">
                  SEARCH
                </Button>
              </Col>
            </Row>
            {/* </Form> */}
          </Col>
          <Col xxl={12}>
            {!isPending && (
              <ul className="names">
                {voters.map((element, index) => {
                  var fullname = element.fullname;
                  var vid = element.id;
                  var record_type = element.record_type;
                  // var supporter = element.supporter;
                  var bday = element.bday;
                  var age = element.age;
                  // var contact = element.contact;
                  // var leader = element.leader;
                  var classes = "nameLink text-primary ";
                  // const type = NewType(1);
                  // console.log("TYPE FROM HOME: "+ NewType(1));
                  //console.log(contact);

                  const textArray = fullname.split(RegExp(searchTxt, "ig"));
                  const match = fullname.match(RegExp(searchTxt, "ig"));

                  console.log(element);

                  if (record_type === "NICL") {
                    classes += " text-danger";
                  }

                  // function getBadge() {
                  //   if (supporter >= 1) {
                  //     return (
                  //       <i className="bi bi-check-circle-fill text-info mx-1"></i>
                  //     );
                  //   }
                  // }

                  return (
                    <li
                      className="names-list"
                      key={vid} // Add a unique key to each list item
                    >
                      <div
                        className={classes}
                        onClick={() => handleSpanClick(vid)}
                      >
                        {textArray.map((item, index) => (
                          <React.Fragment key={index}>
                            {item}
                            {index !== textArray.length - 1 && match && (
                              <strong key={`match-${index}`}>
                                {match[index]}
                              </strong>
                            )}
                          </React.Fragment>
                        ))}
                        {/* {getBadge()} */}
                        {/* {element.fb.map((fb) => (
                          <a
                            href={fb.facebook_id.replace(
                              "fb://profile/",
                              "https://www.facebook.com/profile/"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mx-1"
                          >
                            <i className="bi bi-facebook"></i>
                          </a>
                        ))} */}
                      </div>
                      <p className="details text-muted">
                        <i className="bi bi-house"></i>{" "}
                        {element.address + " " + element.precinct}
                        <br />
                        <i className="bi bi-cake"></i> {bday + " "}
                        {age}yrs
                        <br />
                        {/* {contact.length !== 0 && (
                          <div>
                            <i className="bi bi-telephone"></i>{" "}
                            {contact.map(
                              (item, index) => item.contact_number + " "
                            )}
                          </div>
                        )} */}
                        {/* {element.fb.map((fb) => (
                          <a
                            href={fb.facebook_id.replace(
                              "fb://profile/",
                              "https://www.facebook.com/profile/"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-facebook text-muted"></i>{" "}
                            {fb.facebook_id.replace(
                              "fb://profile/",
                              "https://www.facebook.com/profile/"
                            )}
                          </a>
                        ))} */}
                        {/* {leader.length !== 0 && (
                          <div>
                            <i className="bi bi-person-check"></i>{" "}
                            {element.leader.map((ldr) => (
                              <span className="text-muted leaders">
                                {NewType(ldr.type) +
                                  " " +
                                  ldr.electionyear +
                                  " "}
                              </span>
                            ))}
                          </div>
                        )} */}
                        {/* {element.warding.length !== 0 && (
                          <div>
                            <i
                              className="bi bi-folder-check"
                              data-toggle="tooltip"
                              title="Warded by "
                            ></i>{" "}
                            Warded by{" "}
                            {element.warding.map((war) => (
                              <span className="text-muted leaders">
                                {war.leader + " " + war.electionyear + " "}
                              </span>
                            ))}
                          </div>
                        )} */}
                        {/* {element.remarks.length !== 0 && (
                          <div>
                            <i className="bi bi-tags"></i>{" "}
                            {element.remarks.map((remarks) => (
                              <span className="text-muted remarks">
                                {remarks.remarks_txt + " "}
                              </span>
                            ))}
                          </div>
                        )} */}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {isPending && (
              <div className="names">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;

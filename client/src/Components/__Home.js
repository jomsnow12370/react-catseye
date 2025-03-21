import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import NewType from "./GetLeaderType";
import VoterImage from "./GetImage";
import "../App.css";

const Home = () => {
  const [searchTxt, setSearchTxt] = useState("");
  const [voters, setVoters] = useState([]);
  const [isPending, setisPending] = useState(false);

  //add useeffect for disabling searchbutton
  //add stop button to stop searching
  const handleOnkeyUp = (event) => {
    setSearchTxt(event.target.value);
    //console.log("value is:", event.target.value);
  };

  const handleSpanClick = (id) => {
    console.log(id);
    const win = window.open("/viewVoter?id=" + id + "", "_blank");
    win.focus();
  };

  const handleSearch = async () => {
    setisPending(true);

    fetch("http://localhost:3002/searchVoter?searchTxt=" + searchTxt + "")
      .then((response) => response.json())
      .then((data) => [setVoters(data), setisPending(false), console.log(data)])
      .catch((error) => console.error("ERR: " + error));
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div
            style={{
              position: "fixed",
              background: "white",
              width: "100%",
              padding: "50px 0px 20px 150px",
            }}
          >
            <h1 className="text-muted poppins-medium mb-1">Search</h1>
            {/* <Form> */}
            <div className="input-group">
              <Form.Group
                className="mb-3 row"
                controlId="searchTxt"
                style={{
                  width: "30%",
                }}
              >
                <Form.Control
                  type="text"
                  placeholder="Juan Dela Cruz, Barangay, Municipality"
                  size="lg"
                  className="searchInput poppins-medium"
                  value={searchTxt}
                  onChange={handleOnkeyUp}
                />
              </Form.Group>

              <Button
                className="mb-3 btn-block btn-light"
                onClick={handleSearch}
                size="lg"
              >
                <i className="bi bi-search"></i>
              </Button>
            </div>
            {voters.length > 0 && (
              <span className="text-muted poppins-light">
                {voters.length} total voter{"[s]"} found...
              </span>
            )}
          </div>
        </div>
      </div>
      <Container
        style={{
          marginTop: "230px",
        }}
      >
        <Row className="align-items-center justify-content-center">
          <Col xxl={12}>
            {!isPending ? (
              <>
                <ul className="names poppins-regular">
                  {voters.map((element, index) => {
                    var fullname = element.fullname;
                    var vid = element.id;
                    var record_type = element.record_type;
                    var supporter = element.supporter;
                    var bday = element.bday;
                    var age = element.age;
                    var contact = element.contact;
                    var leader = element.leader;
                    var classes = "nameLink text-muted ";
                    // const type = NewType(1);
                    // console.log("TYPE FROM HOME: "+ NewType(1));
                    //console.log(contact);

                    const textArray = fullname.split(RegExp(searchTxt, "ig"));
                    const match = fullname.match(RegExp(searchTxt, "ig"));

                    //console.log(element);

                    if (record_type === "NICL") {
                      classes += " text-danger text-decoration-line-through";
                    }

                    function getBadge() {
                      if (supporter >= 1) {
                        return (
                          <i className="bi bi-check-circle-fill text-muted mx-1"></i>
                        );
                      }
                    }

                    return (
                      <li
                        className="names-list"
                        key={index} // Add a unique key to each list item
                      >
                        <div
                          className={classes}
                          onClick={() => handleSpanClick(vid)}
                        >
                          <Row className="">
                            <Col lg={4}>
                              <VoterImage
                                id={vid}
                                picwidth={50}
                                picheight={50}
                              />
                            </Col>
                            <Col lg={8}>
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
                              {getBadge()}
                              {element.fb.map((fb) => (
                                <a
                                  href={fb.facebook_id.replace(
                                    "fb://profile/",
                                    "https://www.facebook.com/profile/"
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mx-1 text-muted"
                                >
                                  <i className="bi bi-facebook"></i>
                                </a>
                              ))}
                              <div className="details text-muted">
                                <i className="bi bi-house"></i>{" "}
                                {element.address + " " + element.precinct}
                                <br />
                                <i className="bi bi-cake"></i> {bday + " "}
                                {age}yrs
                                <br />
                                {contact.length !== 0 && (
                                  <div>
                                    <i className="bi bi-telephone"></i>{" "}
                                    {contact.map(
                                      (item, index) => item.contact_number + " "
                                    )}
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>

                          {element.fb.map((fb) => (
                            <div>
                              <a
                                href={fb.facebook_id.replace(
                                  "fb://profile/",
                                  "https://www.facebook.com/profile/"
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "gray",
                                }}
                              >
                                <i className="bi bi-facebook text-muted"></i>{" "}
                                {fb.facebook_id.replace(
                                  "fb://profile/",
                                  "https://www.facebook.com/profile/"
                                )}
                              </a>
                            </div>
                          ))}
                          {leader.length !== 0 && (
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
                          )}
                          {element.warding.length !== 0 && (
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
                          )}
                          {element.remarks.length !== 0 && (
                            <div>
                              <i className="bi bi-tags"></i>{" "}
                              {element.remarks.map((remarks) => (
                                <span className="text-muted remarks">
                                  {remarks.remarks_txt + " "}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="names">
                <div className="spinner-border text-muted" role="status">
                  {" "}
                </div>{" "}
                Loading results...
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;

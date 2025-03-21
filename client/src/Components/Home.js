import React, { useState, useEffect, useContext } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { Button, Card, CardBody, Image } from "react-bootstrap";
import NewType from "./GetLeaderType";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { getIp, getUserId } from "./Vars";

import NewTag from "./NewTag";

import VoterImage from "./GetImage";
import GetData from "./GetData";
import GetFb from "./GetFb";
import GetUploads from "./VoterUploads";
import FBInputs from "./FacebookInputs";
import GetLeader from "./GetLeader";
import GetWarded from "./GetWarded";
import GetTags from "./GetTags";

import ReactPaginate from "react-paginate";
import ReactDOM from "react-dom";

import Badge from "react-bootstrap/Badge";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import VoterProfile from "./VoterProfile";

const Home = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;
  const [voters, setVoters] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [selectedVoterId, setSelectedVoterId] = useState(null);
  const [vId, setVId] = useState();
  const [voterBackground, setVoterBackground] = useState({});
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [selectedVoterTags, setSelectedVoterTags] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [limit, setLimit] = useState("20");

  const handleSpanClick = (voter) => {
    console.log(voter);
    setVId(voter.v_id);
    setVoterBackground((prevBackground) => ({
      [voter.v_id]: "#3A3B3C",
    }));

    setSelectedVoter(voter);
  };

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      console.log("totally custom!")
    );

    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={decoratedOnClick}
        style={{
          borderRadius: "50px",
          backgroundColor: "#3A3B3C",
          borderColor: "#3A3B3C",
        }}
      >
        {children}
      </Button>
    );
  }

  const Search = () => {
    const [searchTxt, setSearchTxt] = useState("");
    const [isChecked, setIsChecked] = useState(false);


    const handleLimitChange = (event) => {
      setLimit(event.target.value);
    };

    const handleMunicipalityChange = (event) => {
      const selectedMunicipality = event.target.value;
      setMunicipality(selectedMunicipality);

      fetch(getIp() + `/getBarangay?municipality=${selectedMunicipality}`)
        .then((response) => response.json())
        .then((data) => {
          setBarangays(data);
        //  console.log(JSON.stringify(data));
        })
        .catch((error) =>
          console.error("Error on fetching barangays: " + error)
        );
    };

    const handleBarangayChange = (event) => {
      setBarangay(event.target.value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      if (!searchTxt) {
        alert("Input name to search...");
      } else {
        setIsPending(true);

        if (isChecked) {
          fetch(
            getIp() +
            `/searchNoFb?searchTxt=${searchTxt}&limit=${limit}&mun=${municipality}&brgy=${barangay}`
          )
            .then((response) => response.json())
            .then((data) => {
              setVoters(data);
              setIsPending(false);
              console.log(data);
            })
            .catch((error) => console.error("Error on handleSearch: " + error));
        } else {
          fetch(
            getIp() +
            `/searchVoter?searchTxt=${searchTxt}&limit=${limit}&mun=${municipality}&brgy=${barangay}`
          )
            .then((response) => response.json())
            .then((data) => {
              setVoters(data);
              setIsPending(false);
              console.log(data);
            })
            .catch((error) => console.error("Error on handleSearch: " + error));
        }
      }
    };

    return (
      <>
        <h4>Voter Lookup 🔎</h4>
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search (put * to search without name)"
              aria-label="Search"
              aria-describedby="basic-addon2"
              className="searchInput"
              style={{
                borderRadius: "50px",
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
                textIndent: "10px",
                backgroundColor: "#3A3B3C",
                borderColor: "#3A3B3C",
                color: "#E4E6EB",
              }}
              id="searchTxt"
              autoComplete="on"
              onChange={(e) =>
                setSearchTxt(e.target.value)
              }
              value={searchTxt}
              required
            />
            <Button
              variant="outline-secondary"
              id="button-addon2"
              style={{
                border: "0px",
                borderRadius: "0px",
                borderTopRightRadius: "50px",
                borderBottomRightRadius: "50px",
                backgroundColor: "#3A3B3C",
                color: "#E4E6EB",
                borderColor: "transparent",
              }}
              type="submit"
              disabled={isPending}
            >
              <i className="bi bi-search"></i>
            </Button>
          </InputGroup>
          <Row>
            <Col xl={5}>
              <Form.Select
                aria-label="Municipality"
                data-toggle="tooltip"
                title="Municipality"
                className="mb-3"
                style={{
                  borderRadius: "50px",
                  textAlign: "left",
                  textIndent: "10px",
                }}
                onChange={handleMunicipalityChange}
                value={municipality}
              >
                <option value="">Select Municipality</option>
                <option value="BAGAMANOC">Bagamanoc</option>
                <option value="BARAS">Baras</option>
                <option value="BATO">Bato</option>
                <option value="CARAMORAN">Caramoran</option>
                <option value="GIGMOTO">Gigmoto</option>
                <option value="PANDAN">Pandan</option>
                <option value="PANGANIBAN">Panganiban</option>
                <option value="SAN ANDRES">San Andres</option>
                <option value="SAN MIGUEL">San Miguel</option>
                <option value="VIGA">Viga</option>
                <option value="VIRAC">Virac</option>
              </Form.Select>
            </Col>
            <Col xl={7}>
            {/* {JSON.stringify(barangays)} */}
              <Form.Select
                aria-label="Barangay"
                data-toggle="tooltip"
                title="Barangay"
                className="mb-3"
                style={{
                  borderRadius: "50px",
                  textAlign: "left",
                  textIndent: "10px",
                }}
                onChange={handleBarangayChange}
                value={barangay}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay, index) => (
                  <option key={index} value={barangay.barangay}>
                    {barangay.barangay}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xl={6} className="mt-2">
              <Form.Check
                type="checkbox"
                label="No Facebook"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
            </Col>
            <Col xl={6}>
              <Form.Select
                aria-label="Limit"
                data-toggle="tooltip"
                title="Search Limit"
                className="mb-3"
                style={{
                  borderRadius: "50px",
                  textAlign: "left",
                  textIndent: "10px",
                }}
                onChange={handleLimitChange}
                value={limit}
              >

                <option>20</option>
                <option>50</option>
                <option>100</option>
                <option>200</option>
                <option>500</option>
                <option>1000</option>
                <option>3000</option>
                <option value="5000">NO LIMIT</option>
              </Form.Select>
            </Col>
          </Row>
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
          {currentItems.map((voters, index) => {
            const key = `${voters.v_id}-${index}`;
            const background = voterBackground[voters.v_id] || "";

            

            var img = getIp() + `/userprofiles/k.jpg`;
            
            if (voters.vImg[0]) {
           
              if (voters.vImg[0].type !== 1) {
                img = getIp() + `/profiles/${voters.vImg[0].imgname}`;
              } else {
                img =
                  getIp() +
                  `/profiles/${voters.v_idx}/${voters.vImg[0].imgname}`;
              }


            }

            return (
              <li
                className="names-list"
                key={key}
                style={{
                  backgroundColor: background,
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                {/* {JSON.stringify(voters)} */}
                <Row className="align-items-center">
                  <Col lg={2}>
                    <Image
                      src={img}
                      roundedCircle
                      width={50}
                      height={50}
                      style={{ display: "inline" }}
                    />
                  
                  </Col>
                  <Col lg={10}>
                  {/* {JSON.stringify(voters)} */}
                    <div
                      className="poppins-bold nameLink"
                      onClick={() => handleSpanClick(voters)}
                    >
                      {voters.record_type === 2 ? (
                        <>
                          <span className="text-danger text-decoration-line-through">
                            <Badge bg="secondary">{index + 1}.</Badge>{" "}
                            {voters.fullname}
                          </span>
                        </>
                      ) : (
                        <>
                          <Badge bg="secondary">{index + 1}.</Badge>{" "}
                          {voters.fullname}
                        </>
                      )}
                      {/* <small>
                        {voters.fb.map((item, key) => (
                          <>
                            {item.facebook_id && (
                              <i className="bi bi-facebook"></i>
                            )}
                            {item.nofb === 1 && (
                              <Badge bg="warning">nofb</Badge>
                            )}
                            {item.locked === 1 && (
                              <Badge bg="warning">locked</Badge>
                            )}
                            {item.inactive === 1 && (
                              <Badge bg="warning">inactive</Badge>
                            )}
                          </>
                        ))}
                      </small> */}
                    </div>
                    <p style={{ fontSize: "12px", marginBottom: "5px" }}>
                      {voters.address} {" | "} {voters.bday} {" | "}
                      <strong>{voters.age}</strong>
                    </p>
                  </Col>
                </Row>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  function PaginatedItems({ itemsPerPage }) {
    const [itemOffset, setItemOffset] = useState(0);
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = voters.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(voters.length / itemsPerPage);

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
      <Container fluid="false" className="py-5 poppins-regular px-5">
        <Row>
          <Col xl={4}>
            <Card className="p-3">
              <Search />
              <CardBody
                style={{
                  overflowY: "auto",
                  overflowX: "none",
                  height: "60dvh",
                  maxHeight: "60dvh",
                  scrollbarWidth: "thin",
                }}
              >
                {!isPending ? (
                  <PaginatedItems itemsPerPage={200} />
                ) : (
                  <div className="mt-3">
                    <Spinner animation="grow" />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl={8}>
            {selectedVoter && <VoterProfile voter={selectedVoter} />}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;

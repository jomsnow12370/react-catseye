import React, { useState, useEffect, useContext } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Table,
} from "react-bootstrap";
import NewType from "./GetLeaderType";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { getIp, getUserId } from "./Vars";
import CreateTag from "./CreateTag";
import HouseholdWardingTags from "./HouseholdWardingTags";

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
import { toast, Toaster } from "react-hot-toast";

const Warding = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voters, setVoters] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [clickedItems, setClickedItems] = useState({});

  const [purok, setPurok] = useState("");

  const [familyHead, setFamilyHead] = useState(); // State for household data
  const [familyMember, setFamilyMember] = useState([]);
  const [leader, setLeader] = useState([]);
  const [voterList, setVoterList] = useState([]);

  // New states for Leader search
  const [leaderSearchQuery, setLeaderSearchQuery] = useState("");
  const [leaderSearchResults, setLeaderSearchResults] = useState([]);
  const [isLeaderSearching, setIsLeaderSearching] = useState(false);

  const handleAddFamilyHead = (item) => {
    setFamilyHead(item);
  };
  const handleAddToMember = (item) => {
    setClickedItems((prev) => ({
      ...prev,
      [item.v_id]: true, // Replace `item.id` with a unique identifier from your item
    }));
    setFamilyMember((prevMember) => [...prevMember, item]);
  };
  const handleAddToLeader = (item) => {
    setLeader(item);
  };
  const handleDeleteMember = (indexToRemove) => {
    const updatedMembers = familyMember.filter(
      (_, index) => index !== indexToRemove
    );
    setFamilyMember(updatedMembers);
  };

  useEffect(() => {
    // setLeader();
    // setFamilyHead();
    // setFamilyMember([]);
    // setVoterList([]);
  }, []);

  // Debounce the leader search to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (leaderSearchQuery.trim() !== "") {
        handleLeaderSearch(leaderSearchQuery);
      } else {
        setLeaderSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [leaderSearchQuery]);

  const handleLeaderSearch = async (query) => {
    setIsLeaderSearching(true);
    var mun = municipality;
    var brgy = barangay;
    try {
      const response = await fetch(
        getIp() +
          `/searchLeader?text=${encodeURIComponent(
            query
          )}&mun=${mun}&brgy=${brgy}`
      );
      const data = await response.json();
      setLeaderSearchResults(data);
    } catch (error) {
      toast.error("Error searching leader: " + error);
    }
    setIsLeaderSearching(false);
  };

  const handleSaveHousehold = async () => {
    //these are the data I want to send to api
    // console.log("FH " + familyHead.v_id);
    // console.log("FM " + JSON.stringify(familyMember));
    // console.log("L " + leader.v_id);
    // console.log("NV " + JSON.stringify(voterList));
    // e.preventDefault();
    if (!familyHead || !purok) {
      if (!purok) {
        toast.error("Purok is empty.");
      }
      if (!familyHead) {
        toast.error("familyHead is empty.");
      }
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    const data = JSON.stringify({
      familyHead,
      familyMember,
      purok,
      leader,
    });
    const isConfirmed = window.confirm(
      "Are you sure you want to save this household?"
    );

    if (isConfirmed) {
      try {
        const response = await fetch(
          getIp() + "/saveHouseHold?userid=" + userId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Ensure the content type is set to JSON
            },
            body: data,
          }
        );
        if (response.ok) {
          toast.success("Household Saved");
          setFamilyHead();
          setFamilyMember([]);
          // setVoterList([]);
          setIsSubmitting(false);
        } else {
          toast.error("Error.. Household not saved.");
        }
      } catch (error) {
        toast.error("Error while uploading the file:", error);
        toast.error("Error occurred while uploading the file");
      }
    }
  };
  const Search = () => {
    const [searchTxt, setSearchTxt] = useState("");

    const handleMunicipalityChange = (event) => {
      setIsPending(true);
      const selectedMunicipality = event.target.value;
      setMunicipality(selectedMunicipality);

      fetch(getIp() + `/getBarangay?municipality=${selectedMunicipality}`)
        .then((response) => response.json())
        .then((data) => {
          setBarangays(data);
          setIsPending(false);
          //  console.log(JSON.stringify(data));
        })
        .catch((error) => toast.error("Error on fetching barangays: " + error));
    };

    const handleBarangayChange = (event) => {
      setBarangay(event.target.value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      setIsPending(true);
      fetch(
        getIp() +
          `/search?searchTxt=${searchTxt}&mun=${municipality}&brgy=${barangay}`
      )
        .then((response) => response.json())
        .then((data) => {
          setVoters(data);
          setIsPending(false);
        })
        .catch((error) => console.error("Error on handleSearch: " + error));
    };

    return (
      <>
        <h4>Search Voter 🔎</h4>
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
              onChange={(e) => setSearchTxt(e.target.value)}
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
            <Col xl={6}>
              <Form.Select
                aria-label="Municipality"
                data-toggle="tooltip"
                title="Municipality"
                className="mb-3"
                onChange={handleMunicipalityChange}
                value={municipality}
              >
                <option value="">Select Municipality</option>
                <option value="BAGAMANOC">BAGAMANOC</option>
                <option value="BARAS">BARAS</option>
                <option value="BATO">BATO</option>
                <option value="CARAMORAN">CARAMORAN</option>
                <option value="GIGMOTO">GIGMOTO</option>
                <option value="PANDAN">PANDAN</option>
                <option value="PANGANIBAN">PANGANIBAN</option>
                <option value="SAN ANDRES">SAN ANDRES</option>
                <option value="SAN MIGUEL">SAN MIGUEL</option>
                <option value="VIGA">VIGA</option>
                <option value="VIRAC">VIRAC</option>
              </Form.Select>
            </Col>
            <Col xl={6}>
              <Form.Select
                aria-label="Barangay"
                data-toggle="tooltip"
                title="Barangay"
                className="mb-3"
                onChange={handleBarangayChange}
                value={barangay}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay, index) => (
                  <option key={index} value={barangay.v_barangay}>
                    {barangay.barangay}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

  return (
    <>
      <Container fluid="false" className="py-5 poppins-regular px-5">
        <Toaster />
        <Row className="align-items-center justify-content-center">
          <Col lg={9}>
            <Card className="p-3">
              <CardBody
                style={{
                  overflowY: "auto",
                  overflowX: "none",
                  height: "60dvh",
                  maxHeight: "60dvh",
                  scrollbarWidth: "thin",
                }}
              >
                <Search />

                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Information</th>
                      <th>Address</th>
                      <th className="text-center">Family Head</th>
                      <th className="text-center">Family Member</th>
                      <th className="text-center" width="400px">
                        Tags
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isPending ? (
                      voters.map((item, index) => (
                        <tr
                          key={item.v_id}
                          data-toggle="tooltip"
                          title={
                            item.tagged[0].leadercnt > 0 &&
                            item.tagged[0].cnt == 0 &&
                            item.tagged[0].cntt == 0
                              ? "Leader"
                              : item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0
                              ? "Household member of: " +
                                item.tagged[0].fhfullname +
                                " recorded by: " +
                                item.tagged[0].username
                              : "NO WARDING RECORD"
                          }
                        >
                          <td
                            width={30}
                            className="text-center"
                            style={{
                              backgroundColor:
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                item.tagged[0].leadercnt > 0
                                  ? "green"
                                  : "transparent",
                              color: item.record_type == 2 && "red",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            width={250}
                            style={{
                              backgroundColor:
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                item.tagged[0].leadercnt > 0
                                  ? "green"
                                  : "transparent",
                              color: item.record_type == 2 && "red",
                            }}
                          >
                            {" "}
                            <div>
                              {item.record_type == 2 ? (
                                <s>{item.fullname}</s>
                              ) : (
                                item.fullname
                              )}
                            </div>
                            <div style={{ fontStyle: "italic" }}>
                              {item.bday + " - " + item.age}
                            </div>
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                item.tagged[0].leadercnt > 0
                                  ? "green"
                                  : "transparent",
                              color: item.record_type == 2 && "red",
                            }}
                          >
                            <div style={{ fontStyle: "italic" }}>
                              {item.address}
                            </div>
                          </td>
                          <td
                            className="text-center"
                            style={{
                              backgroundColor:
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                item.tagged[0].leadercnt > 0
                                  ? "green"
                                  : "transparent",
                              color: item.record_type == 2 && "red",
                            }}
                          >
                            {!familyHead ? (
                              <Button
                                variant="primary"
                                className="w-100"
                                onClick={() => handleAddFamilyHead(item)}
                                disabled={
                                  item.tagged[0].cnt > 0 ||
                                  item.tagged[0].cntt > 0
                                    ? true
                                    : false || item.record_type == 2
                                    ? true
                                    : false
                                }
                              >
                                <i className="bi bi-person-add"></i> Head
                              </Button>
                            ) : (
                              <Button variant="primary" disabled>
                                <i className="bi bi-person-add"></i> Head
                              </Button>
                            )}
                          </td>

                          <td
                            className="text-center"
                            style={{
                              backgroundColor:
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                item.tagged[0].leadercnt > 0
                                  ? "green"
                                  : "transparent",
                              color: item.record_type == 2 && "red",
                            }}
                          >
                            <Button
                              variant="info"
                              className="w-100"
                              onClick={() => handleAddToMember(item)}
                              disabled={
                                item.tagged[0].cnt > 0 ||
                                item.tagged[0].cntt > 0 ||
                                clickedItems[item.id]
                                  ? true
                                  : false ||
                                    (familyMember?.some(
                                      (head) => head.v_id === item.v_id
                                    ) ??
                                      false) ||
                                    item.record_type == 2
                                  ? true
                                  : false
                              }
                            >
                              <i className="bi bi-person-add"></i> Member
                            </Button>
                          </td>
                          <td>
                            <HouseholdWardingTags
                              leader={item}
                              userId={userId}
                              mun={municipality}
                            />
                          </td>
                        </tr>
                      ))  
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <div className="mt-3">
                            <Spinner animation="grow" />
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3}>
            <Card className="p-3">
              <CardBody
                style={{
                  overflowY: "auto",
                  height: "60dvh",
                  maxHeight: "60dvh",
                  scrollbarWidth: "thin",
                }}
              >
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Purok/Street</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Input Purok or Street"
                    onChange={(e) => setPurok(e.target.value.toUpperCase())}
                    value={purok.toUpperCase()}
                    required
                  />
                </Form.Group>
                <h4 className="w-100">
                  Family Head{" "}
                  <Button
                    variant="danger"
                    style={{ float: "right" }}
                    onClick={() => {
                      setFamilyHead();
                      setPurok("");
                      setFamilyMember([]);
                      setVoterList([]);
                    }}
                    className="mb-3"
                    size="sm"
                  >
                    Clear
                  </Button>
                </h4>

                {familyHead ? (
                  <p>
                    <strong>
                      {familyHead.fullname}{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setFamilyHead()}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </strong>
                  </p>
                ) : (
                  <p>
                    <strong>No head of household added yet.</strong>
                  </p>
                )}
                <h4>Family Members</h4>
                {familyMember.length > 0 ? (
                  <ul>
                    {familyMember.map((person, index) => (
                      <li key={index}>
                        <strong>
                          {index + 1}. {person.fullname}{" "}
                        </strong>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMember(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No household members added yet.</p>
                )}
                <h4>Leader</h4>
                {/* add leader form control here that will have an onchange function that will search for the leader in the database upon entering leader name here. and will have a div below for the leaders search result. upon clicking the leader will save the leaderId to a useState  */}

                {/* Leader search input and results */}
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search Leader"
                    value={leaderSearchQuery}
                    onChange={(e) =>
                      setLeaderSearchQuery(e.target.value.toUpperCase())
                    }
                  />
                </Form.Group>
                {isLeaderSearching ? (
                  <div>
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  leaderSearchResults.length > 0 && (
                    <div
                      className="leader-search-results"
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
                      {leaderSearchResults.map((item) => (
                        <div
                          key={item.v_id}
                          onClick={() => {
                            setLeader(item);
                            setLeaderSearchQuery(item.fullname);
                            setLeaderSearchResults([]);
                          }}
                          style={{
                            padding: "5px",
                            cursor: "pointer",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          {item.fullname} [{item.v_barangay}]
                        </div>
                      ))}
                    </div>
                  )
                )}
                {leader && (
                  <p>
                    <strong>Selected Leader: {leader.fullname}</strong>
                  </p>
                )}
                <Button
                  className="w-100"
                  variant="primary"
                  onClick={() => handleSaveHousehold()}
                  disabled={isSubmitting}
                >
                  SAVE HOUSEHOLD
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Warding;

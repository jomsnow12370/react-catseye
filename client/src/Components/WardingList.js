import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  Button,
  Table,
  Form,
  Modal,
  Accordion,
  Card,
  CardBody,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getIp } from "./Vars";
import Spinner from "react-bootstrap/Spinner";
import { toast, Toaster } from "react-hot-toast";
import CreateTag from "./CreateTag";
import HouseholdWardingTags from "./HouseholdWardingTags";

const WardingList = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  const [households, setHouseholds] = useState([]);
  const [purok, setPurok] = useState("");
  const [newPurok, setNewPurok] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [addMemberText, setAddmemberText] = useState("");
  const [searchLeadertxt, setSearchLeadertxt] = useState("");
  const [editingLeader, setEditingLeader] = useState(false);

  // New state for updating Family Head:
  const [searchFhTxt, setSearchFhTxt] = useState("");
  const [fhResults, setFhResults] = useState([]);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter households based on the search query
  // Filter households based on the search query
  const filteredHouseholds = households.filter((family) => {
    // Check if family head name matches search query
    const fhMatches =
      family.fh?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    // Check if any family member's name matches search query, handling empty or undefined members
    const memberMatches = Array.isArray(family.members)
      ? family.members.some((member) =>
          member.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : false;

    // Return true if either the family head or any member matches
    return fhMatches || memberMatches;
  });

  const handleMunicipalityChange = (event) => {
    const selectedMunicipality = event.target.value;
    setMunicipality(selectedMunicipality);

    fetch(getIp() + `/getBarangay?municipality=${selectedMunicipality}`)
      .then((response) => response.json())
      .then((data) => {
        setBarangays(data);
      })
      .catch((error) => console.error("Error on fetching barangays: " + error));
  };

  const handleSearchVoter = (e) => {
    try {
      setAddmemberText(e.target.value);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSetPurok = (e) => {
    setPurok(e.target.value);
  };

  useEffect(() => {
    if (selectedHousehold) {
      setPurok(selectedHousehold.purok_st || "");
    }
  }, [selectedHousehold]);

  const handleSearchVoterButton = () => {
    fetch(
      getIp() +
        "/searchMember?text=" +
        addMemberText +
        "&mun=" +
        municipality +
        "&brgy=" +
        barangay
    )
      .then((response) => response.json())
      .then((data) => setMembers(data))
      .catch((error) => console.error("Error on getdata: " + error));
  };

  const handleSearchLeader = () => {
    fetch(
      getIp() +
        "/searchLeader?text=" +
        searchLeadertxt +
        "&mun=" +
        municipality +
        "&brgy=" +
        barangay
    )
      .then((response) => response.json())
      .then((data) => setLeaders(data))
      .catch((error) => console.error("Error on getdata: " + error));
  };

  // New function: Search for new Family Head
  const handleSearchFh = () => {
    fetch(
      getIp() +
        "/searchMember?text=" +
        searchFhTxt +
        "&mun=" +
        municipality +
        "&brgy=" +
        barangay
    )
      .then((response) => response.json())
      .then((data) => setFhResults(data))
      .catch((error) =>
        console.error("Error on searching family head:", error)
      );
  };

  const handleBarangayChange = (event) => {
    setBarangay(event.target.value);
  };

  const handleAddmember = (item, fhid) => {
    const hmember = item.v_id;
    const household = fhid;

    try {
      fetch(
        getIp() +
          "/addMember?fhid=" +
          household +
          "&memid=" +
          hmember +
          "&uid=" +
          userId,
        {
          method: "POST",
        }
      );
      setHouseholds((prevHouseholds) =>
        prevHouseholds.map((household) =>
          household.fhid === selectedHousehold.fhid
            ? { ...household, members: [...household.members, item] }
            : household
        )
      );
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  const handleUpdatePurok = async () => {
    const data = JSON.stringify({
      selectedHousehold,
      purok,
    });

    if (!purok) {
      toast.error("Purok is empty.");
      return;
    }
    const isConfirmed = window.confirm(
      "Are you sure you want to update purok data?"
    );

    if (isConfirmed) {
      try {
        const response = await fetch(
          getIp() + "/updatePurok?userid=" + userId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: data,
          }
        );
        if (response.ok) {
          toast.success("Purok updated.");
          setHouseholds((prevHouseholds) =>
            prevHouseholds.map((household) =>
              household.fhid === selectedHousehold.fhid
                ? { ...household, purok_st: purok }
                : household
            )
          );
        } else {
          toast.error("Error.. Purok not updated.");
        }
      } catch (error) {
        toast.error("Error while updating purok:" + error);
      }
    }
  };

  const handleAddLeader = async (leaderid, fhid, leadername) => {
    try {
      const response = await fetch(
        getIp() +
          "/updateHouseholdLeader?fhid=" +
          fhid +
          "&leaderid=" +
          leaderid,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update leader");
      }
      // Refresh households after update
      fetch(
        getIp() +
          `/getHouseholds?mun=${municipality}&brgy=${barangay}&uid=${userId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setHouseholds(data);
          setIsPending(false);
        })
        .catch((error) => console.error("ERR: " + error));

      toast.success("Leader was saved successfully.");
      setEditingLeader(false);
    } catch (error) {
      console.error("Error while saving:", error);
      toast.error("Error while saving leader.");
    }
  };

  // New function: Update Family Head (head of household)
  const handleUpdateFamilyHead = async (newFhid, newFhName) => {
    try {
      const response = await fetch(
        getIp() +
          "/updateHouseholdHead?currentFhid=" +
          selectedHousehold.fhid +
          "&newFhid=" +
          newFhid,
        { method: "POST" }
      );
      toast.success("Family head updated successfully.");
      if (!response.ok) {
        throw new Error("Failed to update family head");
      }
      // Update the household state with the new family head
      setHouseholds((prevHouseholds) =>
        prevHouseholds.map((household) =>
          household.fhid === selectedHousehold.fhid
            ? { ...household, fh: newFhName, fhid: newFhid }
            : household
        )
      );

      // Update the selected household state as well
      setSelectedHousehold((prevSelected) =>
        prevSelected && prevSelected.fhid === selectedHousehold.fhid
          ? { ...prevSelected, fh: newFhName, fhid: newFhid }
          : prevSelected
      );

      // Clear search fields and results
      setSearchFhTxt("");
      setFhResults([]);
    } catch (error) {
      console.error("Error updating family head:", error);
      toast.error("Error updating family head.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHousehold(null);
    setEditingLeader(false);
  };

  const handleEditHousehold = (householdId) => {
    const household = households.find((h) => h.fhid === householdId);
    setSelectedHousehold(household);
    setShowModal(true);
  };

  const handleDeleteHousehold = (indexToDelete, id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this household?"
    );
    if (isConfirmed) {
      const updatedHouseholds = households.filter(
        (_, index) => index !== indexToDelete
      );
      try {
        fetch(getIp() + "/deleteHousehold?fhid=" + id, {
          method: "POST",
        });
        setHouseholds(updatedHouseholds);
      } catch (error) {
        console.error("Error while deleting:", error);
      }
    }
  };

  const handleDeleteMember = (fhid, id, memberIndex) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this household member?"
    );
    if (isConfirmed) {
      try {
        fetch(
          getIp() + "/deleteHouseholdMember?fhid=" + fhid + "&memid=" + id,
          {
            method: "POST",
          }
        );
        setHouseholds((prevHouseholds) =>
          prevHouseholds.map((household) =>
            household.fhid === selectedHousehold.fhid
              ? {
                  ...household,
                  members: household.members.filter(
                    (_, index) => index !== memberIndex
                  ),
                }
              : household
          )
        );
      } catch (error) {
        console.error("Error while deleting member:", error);
      }
    }
  };

  // New function to enable leader editing
  const toggleEditLeader = () => {
    setEditingLeader(!editingLeader);
    setSearchLeadertxt("");
    setLeaders([]);
  };

  useEffect(() => {
    setIsPending(true);
    fetch(
      getIp() +
        `/getHouseholds?mun=${municipality}&brgy=${barangay}&uid=${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setHouseholds(data);
        setIsPending(false);
      })
      .catch((error) => console.error("ERR: " + error));
  }, [barangay]);

  useEffect(() => {
    if (selectedHousehold) {
      const updatedSelectedHousehold = households.find(
        (household) => household.fhid === selectedHousehold.fhid
      );
      if (updatedSelectedHousehold) {
        setPurok(updatedSelectedHousehold.purok_st);
        setSelectedHousehold(updatedSelectedHousehold);
      }
    }
  }, [households]);

  return (
    <>
      <Container fluid="false" className="py-5 poppins-regular px-5">
        <Toaster />
        <Row className="justify-content-center align-items-center">
          <Col lg={12}>
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
                <Row>
                  <Col xl={12}>
                    <h2>My Warding</h2>
                  </Col>
                  <Col xl={6}>
                    <Form.Select
                      aria-label="Municipality"
                      data-toggle="tooltip"
                      title="Municipality"
                      className="mb-3"
                      onChange={handleMunicipalityChange}
                      style={{
                        textTransform: "uppercase",
                        fontFamily: "Poppins",
                      }}
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
                        <option key={index} value={barangay.barangay}>
                          {barangay.barangay}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div>
                      {isPending ? (
                        <div className="mt-3">
                          <Spinner animation="grow" />
                        </div>
                      ) : (
                        <>
                          <Form className="mb-3">
                            <Form.Control
                              type="text"
                              placeholder="Search households..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </Form>
                          <Accordion defaultActiveKey="0">
                            {filteredHouseholds.map((family, index) => (
                              <Accordion.Item
                                eventKey={index.toString()}
                                key={index}
                              >
                                <Accordion.Header>
                                  {index + 1}. {family.fh} | Purok:{" "}
                                  {family.purok_st || "No data"}
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    data-toggle="tooltip"
                                    title="Edit Household"
                                    onClick={() =>
                                      handleEditHousehold(family.fhid)
                                    }
                                    style={{ marginLeft: "10px" }}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    data-toggle="tooltip"
                                    title="Delete Household"
                                    onClick={() =>
                                      handleDeleteHousehold(index, family.fhid)
                                    }
                                    style={{ marginLeft: "10px" }}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </Accordion.Header>
                                <Accordion.Body>
                                  <table className="table table-bordered table-striped">
                                    <thead>
                                      <tr>
                                        <th>Member Fullname</th>
                                        <th>Address</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {family.members.length > 0 ? (
                                        family.members.map(
                                          (member, memberIndex) => (
                                            <tr key={memberIndex}>
                                              <td>
                                                {/* {JSON.stringify(member)} */}
                                                {memberIndex + 1}.{" "}
                                                {member.fullname}
                                              </td>
                                              <td>
                                                <div>
                                                  <i>
                                                    {member.barangay}{" "}
                                                    {member.municipality}
                                                  </i>
                                                </div>
                                              </td>
                                              <td>
                                                <HouseholdWardingTags
                                                  leader={member}
                                                  userId={userId}
                                                  mun={municipality}
                                                />
                                              </td>
                                            </tr>
                                          )
                                        )
                                      ) : (
                                        <tr>
                                          <td colSpan="6">No members</td>
                                        </tr>
                                      )}
                                      <tr>
                                        <td colSpan="6">
                                          Leader :{" "}
                                          {family.leader?.[0]?.fullname}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </Accordion.Body>
                              </Accordion.Item>
                            ))}
                            {filteredHouseholds.length === 0 && (
                              <p className="text-muted text-center mt-3">
                                No households match your search.
                              </p>
                            )}
                          </Accordion>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modal for editing a household */}
        {selectedHousehold && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Household</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Leader Section */}
              <p>
                Leader:{" "}
                {!selectedHousehold.leaderid || editingLeader ? (
                  <>
                    <InputGroup className="mb-3">
                      <Form.Control
                        placeholder="Search leader"
                        aria-label="Search leader"
                        value={searchLeadertxt}
                        onChange={(e) => setSearchLeadertxt(e.target.value)}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleSearchLeader}
                      >
                        <i className="bi bi-search"></i> Find
                      </Button>
                    </InputGroup>
                    {leaders &&
                      searchLeadertxt !== "" &&
                      leaders.map((item, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="dark"
                          className="me-1 mb-1"
                          onClick={() =>
                            handleAddLeader(
                              item.v_id,
                              selectedHousehold.fhid,
                              item.fullname
                            )
                          }
                        >
                          {item.fullname}
                        </Button>
                      ))}
                  </>
                ) : (
                  <>
                    <strong>{selectedHousehold.leader[0].fullname}</strong>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={toggleEditLeader}
                      className="ms-2"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Button>
                  </>
                )}
              </p>
              {/* Family Head Section */}
              <h5>
                Family Head: <strong>{selectedHousehold.fh}</strong>
              </h5>
              <p>Update Family Head:</p>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Search new family head"
                  aria-label="Search new family head"
                  value={searchFhTxt}
                  onChange={(e) => setSearchFhTxt(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={handleSearchFh}>
                  <i className="bi bi-search"></i> Find
                </Button>
              </InputGroup>
              {fhResults &&
                searchFhTxt !== "" &&
                fhResults.map((item, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="dark"
                    className="me-1 mb-1"
                    disabled={item.cnt + item.cnt2 > 0}
                    title={item.barangay + ", " + item.municipality}
                    onClick={() =>
                      handleUpdateFamilyHead(item.v_id, item.fullname)
                    }
                  >
                    {item.fullname}
                  </Button>
                ))}
              <hr></hr>
              <h5>Family Members</h5>
              <ul>
                {selectedHousehold.members.length > 0 ? (
                  selectedHousehold.members.map((member, memberIndex) => (
                    <li key={memberIndex}>
                      {memberIndex + 1}. {member.fullname}
                      <Button
                        variant="dark"
                        size="sm"
                        className="ms-2"
                        onClick={() =>
                          handleDeleteMember(
                            selectedHousehold.fhid,
                            member.mem_v_id,
                            memberIndex
                          )
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </li>
                  ))
                ) : (
                  <>
                    <br />
                    NO MEMBER
                  </>
                )}
              </ul>
              {/* Add Member Section */}
              Add Member
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Search voter"
                  aria-label="Search voter"
                  value={addMemberText}
                  onChange={handleSearchVoter}
                />
                <Button
                  variant="outline-secondary"
                  onClick={handleSearchVoterButton}
                >
                  <i className="bi bi-search"></i> Find
                </Button>
              </InputGroup>
              {members &&
                addMemberText !== "" &&
                members.map((item, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="dark"
                    className="me-1 mb-1"
                    disabled={item.cnt + item.cnt2 > 0}
                    title={item.barangay + ", " + item.municipality}
                    onClick={() =>
                      handleAddmember(item, selectedHousehold.fhid)
                    }
                  >
                    {item.fullname}
                  </Button>
                ))}
              {/* Purok Section */}
              <hr></hr>
              Purok:{" "}
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Purok"
                  aria-label="Purok"
                  onChange={handleSetPurok}
                  value={purok}
                />
                <Button variant="outline-secondary" onClick={handleUpdatePurok}>
                  <i className="bi bi-upload"></i> UPDATE
                </Button>
              </InputGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              {/* Additional save/edit functionality can be added here if needed */}
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
};

export default WardingList;

import React, { useState, useEffect, useRef } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { Dropdown } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { toast, Toaster } from "react-hot-toast";
import ListGroup from "react-bootstrap/ListGroup";
import MunicipalityBarangaySelect from "./LocationSelects";
import SignatureCanvas from "react-signature-canvas";
import GetType from "./GetLeaderType";
import { getIp } from "./Vars";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Registration = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  // State variables
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sigPad, setSigPad] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [leaderPhoto, setLeaderPhoto] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newLeaderModal, setNewLeaderModal] = useState(false);

  // New leader search states
  const [newLeaderSearchInput, setNewLeaderSearchInput] = useState("");
  const [newLeaderSearchResults, setNewLeaderSearchResults] = useState([]);
  const [isNewLeaderLoading, setIsNewLeaderLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // For signature canvas container
  const canvasContainerRef = useRef(null);

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  // NEW: States for the Tag Leader Modal (the new design)
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTagLeader, setSelectedTagLeader] = useState(null);
  const [tagCategory, setTagCategory] = useState("cua"); // "cua" or "laynes"

  // Handlers to add leader (for Cua and Laynes)
  const handleAddLeader = async (vid, leaderType) => {
    try {
      const response = await fetch(getIp() + "/saveLeader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vid, userId, leaderType }),
      });
      if (response.ok) {
        alert("Leader Saved.");
      } else {
        console.log("Failed to save the leader due to errors");
      }
    } catch (error) {
      console.error("Error while saving the leader:", error);
    }
  };

  const handleAddLeaderLaynes = async (vid, leaderType) => {
    try {
      const response = await fetch(getIp() + "/saveLeaderLaynes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vid, userId, leaderType }),
      });
      if (response.ok) {
        alert("Leader Saved.");
      } else {
        console.log("Failed to save the leader due to errors");
      }
    } catch (error) {
      console.error("Error while saving the leader:", error);
    }
  };

  const handleNewLeaderSearch = async (e) => {
    e.preventDefault();
    if (!newLeaderSearchInput.trim()) return;
    setIsNewLeaderLoading(true);
    try {
      const response = await fetch(
        `${getIp()}/searchVoterNewLeader?searchTxt=${newLeaderSearchInput}&municipality=${municipality}&barangay=${barangay}`
      );
      const data = await response.json();
      setNewLeaderSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching voters");
    } finally {
      setIsNewLeaderLoading(false);
    }
  };

  const handleNewLeader = async () => {
    setNewLeaderModal(true);
  };

  const [leaderCounts, setLeaderCounts] = useState({
    ward: 0,
    barangay: 0,
    district: 0,
    municipal: 0,
  });

  const handleSignature = (leader) => {
    setSelectedLeader(leader);
    setShowModal(true);
  };

  const handlePhotoModal = (leader) => {
    setSelectedLeader(leader);
    setShowPhotoModal(true);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        getIp() +
          `/getLeadersRegistration?municipality=${municipality}&barangay=${barangay}`
      );
      const data = await response.json();
      setLeaders(data);
      const counts = {
        ward: data.filter((leader) => leader.type === 1).length,
        barangay: data.filter((leader) => leader.type === 2).length,
        district: data.filter((leader) => leader.type === 3).length,
        municipal: data.filter((leader) => leader.type === 4).length,
      };
      setLeaderCounts(counts);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeaders = leaders.filter((leader) => {
    const fullName = `${leader.v_fname} ${leader.v_mname || ""} ${
      leader.v_lname
    }`.toLowerCase();
    const typeMatch = !filterType || leader.type.toString() === filterType;
    return fullName.includes(search.toLowerCase()) && typeMatch;
  });

  const handleSignatureSave = async () => {
    if (!sigPad || !selectedLeader) {
      console.error("No signature or leader selected.");
      return;
    }
    setIsUploading(true);
    const signatureData = sigPad.toDataURL();
    const blob = await fetch(signatureData).then((res) => res.blob());
    const file = new File([blob], "signature.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(
        getIp() + `/uploadSignature?id=${selectedLeader.v_id}&userid=${userId}`,
        { method: "POST", body: formData }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedLeaders = leaders.map((leader) =>
          leader.v_id === selectedLeader.v_id
            ? { ...leader, signature: 1 }
            : leader
        );
        setIsUploading(false);
        setLeaders(updatedLeaders);
        setShowModal(false);
        setSigPad(null);
        toast.success("Signature uploaded.");
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to upload signature:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo || !selectedLeader) {
      console.error("No photo or leader selected.");
      return;
    }
    const formData = new FormData();
    formData.append("file", photo);
    try {
      const response = await fetch(
        getIp() + `/uploadPhoto?id=${selectedLeader.v_id}&userid=${userId}`,
        { method: "POST", body: formData }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedLeaders = leaders.map((leader) =>
          leader.v_id === selectedLeader.v_id
            ? { ...leader, photo: `${selectedLeader.v_id}/${data.fileName}` }
            : leader
        );
        setLeaders(updatedLeaders);
        setShowPhotoModal(false);
        setPhoto(null);
        toast.success(
          "Photo uploaded and leader's photo updated successfully."
        );
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to upload photo:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const handleAttended = async (leader) => {
    try {
      const response = await fetch(getIp() + "/markAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader_id: leader.v_id,
          userid: userId,
          attendance_status: "attended",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success("Attendance marked successfully!");
        const updatedLeaders = leaders.map((leaderx) =>
          leaderx.v_id === leader.v_id
            ? { ...leaderx, attendance_status: "attended" }
            : leaderx
        );
        setLeaders(updatedLeaders);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Error marking attendance.");
    }
  };

  const handleUnattend = async (leader) => {
    try {
      const response = await fetch(getIp() + "/deleteAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader_id: leader.v_id,
          userid: userId,
             }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success("Attendance marked successfully!");
        const updatedLeaders = leaders.map((leaderx) =>
          leaderx.v_id === leader.v_id
            ? { ...leaderx, attendance_status: "" }
            : leaderx
        );
        setLeaders(updatedLeaders);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Error marking attendance.");
    }
  };

  const handlePhoneModal = async (leader) => {
    setSelectedLeader(leader);
    try {
      const response = await fetch(
        getIp() + `/getPhoneNumbers?v_id=${leader.v_id}`
      );
      const data = await response.json();
      if (response.ok) {
        setPhoneNumbers(data.phone_numbers || []);
        setShowPhoneModal(true);
      } else {
        console.error("Failed to fetch phone numbers:", data.error);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    }
  };

  const handleAddPhoneNumber = async () => {
    if (!newPhoneNumber.trim() || !selectedLeader) {
      console.error("No phone number or leader selected.");
      return;
    }
    try {
      const response = await fetch(getIp() + "/addPhoneNumber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader_id: selectedLeader.v_id,
          phone_number: newPhoneNumber.trim(),
          userid: userId,
        }),
      });
      if (response.ok) {
        setPhoneNumbers([
          ...phoneNumbers,
          { contact_number: newPhoneNumber.trim() },
        ]);
        setNewPhoneNumber("");
        toast.success("Phone number added successfully.");
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to add phone number:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error adding phone number:", error);
    }
  };

  const handleDeletePhoneNumber = async (id) => {
    try {
      const response = await fetch(getIp() + `/deletePhoneNumber?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPhoneNumbers(phoneNumbers.filter((num) => num.id !== id));
        toast.success("Phone number deleted successfully.");
      } else {
        console.error("Failed to delete phone number.");
      }
    } catch (error) {
      console.error("Error deleting phone number:", error);
    }
  };

  return (
    <Container fluid className="poppins-regular p-2">
      <Toaster />
      <Row>
        <Col xs={6}>
          <h1>Leader Registration</h1>
        </Col>
        <Col xs={2}>
        <Button
            variant="success"
            className="w-100"
            title="Liquidation Report"
            onClick={() => {
             
              navigate("/liquidationreport");
            }}
          >
            <i className="bi bi-file"></i>
          </Button>
        </Col>
        <Col xs={2}>
          <Button
            variant="primary"
            className="w-100"
            title="Add new leader"
            onClick={handleNewLeader}
          >
            <i className="bi bi-plus"></i>
          </Button>
        </Col>
        <Col xs={2}>
          <Button
            variant="danger"
            className="w-100"
            title="Logout"
            onClick={() => {
              sessionStorage.removeItem("user");
              navigate("/");
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
          </Button>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <MunicipalityBarangaySelect
                  municipality={municipality}
                  setMunicipality={setMunicipality}
                  barangay={barangay}
                  setBarangay={setBarangay}
                />
              </Row>
              <Row>
                <Col xl={12}>
                  <Button
                    className="w-100"
                    variant="primary"
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="bi bi-hourglass-split"></i> Searching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search"></i> Search
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col xs={8}>
          <Form.Control
            type="text"
            placeholder="Search Leader"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={4}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="1">Ward Leader</option>
            <option value="2">Barangay Coordinator</option>
            <option value="3">District Coordinator</option>
            <option value="4">Municipal Coordinator</option>
          </Form.Select>
        </Col>
      </Row>
      {leaders.length > 0 && !isLoading && (
        <Row>
          <Col xs={12} className="text-center">
            <p>
              Ward Leaders: <strong>{leaderCounts.ward}</strong> | Barangay
              Coordinators: <strong>{leaderCounts.barangay}</strong> | District
              Coordinators: <strong>{leaderCounts.district}</strong> | Municipal
              Coordinators: <strong>{leaderCounts.municipal}</strong>
            </p>
          </Col>
        </Row>
      )}
      <Row>
        {isLoading ? (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Fetching data...</p>
          </div>
        ) : (
          filteredLeaders.map((leader, index) => (
            <Col key={index} xl={3} lg={4} md={6} sm={12} className="mb-3">
              <Card className="shadow-sm p-2">
                <Row className="align-items-center">
                  <Col xs={2} className="text-center">
                    <Card.Img
                      src={
                        `${getIp()}/profiles/${leader.photo}` ||
                        `${getIp()}/userprofiles/k.jpg`
                      }
                      className="rounded-circle"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                      onError={(e) =>
                        (e.target.src = `${getIp()}/userprofiles/k.jpg`)
                      }
                    />
                  </Col>
                  <Col xs={10}>
                    <Card.Body>
                      <Card.Title className="mb-0">
                        <i>{index + 1}. </i>
                        <strong>
                          {leader.v_lname}, {leader.v_fname}{" "}
                          {leader.v_mname || ""}
                        </strong>
                      </Card.Title>
                      <Card.Text className="text-muted">
                        {leader.type === 1
                          ? "Ward Leader"
                          : leader.type === 2
                          ? "Barangay Coordinator"
                          : leader.type === 3
                          ? "District Coordinator"
                          : "Municipal Coordinator"}
                        {leader.laynes === 1 && " - Laynes"}
                      </Card.Text>
                      <ButtonGroup className="w-100">
                          <Button
                          size="sm"
                          variant={
                            leader.signature >= 1
                              ? "success"
                              : "dark"
                          }
                          onClick={() => handleSignature(leader)}
                          disabled={leader.signature >= 1}
                        >
                          <i className="bi bi-pen"></i> Sign
                        </Button>
                        <Button
                          size="sm"
                          variant="dark"
                          onClick={() => handlePhotoModal(leader)}
                        >
                          <i className="bi bi-camera"></i> Photo
                        </Button>
                        <Button
                          size="sm"
                          variant="dark"
                          onClick={() => handlePhoneModal(leader)}
                        >
                          <i className="bi bi-phone"></i> Phone
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            leader.attendance_status === "attended"
                              ? "success"
                              : "dark"
                          }
                          onClick={() =>
                            leader.attendance_status === "attended"
                              ? handleUnattend(leader)
                              : handleAttended(leader)
                          }
                        >
                          <i
                            className={`bi ${
                              leader.attendance_status === "attended"
                                ? "bi-check-circle-fill"
                                : "bi-check-circle"
                            }`}
                          ></i>{" "}
                          {leader.attendance_status === "attended"
                            ? "Attended"
                            : "Mark Attended"}
                        </Button>
                      </ButtonGroup>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Signature Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} fullscreen>
  <Modal.Body className="p-0">
    <div
      ref={canvasContainerRef}
      style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}
    >
      <div style={{ backgroundColor: "white", height: "100%" }}>
        <SignatureCanvas
          ref={(ref) => setSigPad(ref)}
          penColor="black"
          dotSize={12}
          minWidth={3}
          maxWidth={6}
          canvasProps={{
            width: canvasContainerRef.current
              ? canvasContainerRef.current.offsetWidth
              : window.innerWidth,
            height: canvasContainerRef.current
              ? canvasContainerRef.current.offsetHeight - 100
              : window.innerHeight - 100,
          }}
        />
      </div>

      {/* Floating action buttons - fixed position to ensure visibility */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 1050,
        }}
      >
        <Button
          variant="danger"
          onClick={() => setShowModal(false)}
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
             <i className="bi bi-x"></i>
        </Button>
        <Button
          variant="warning"
          onClick={() => sigPad.clear()}
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
             <i className="bi bi-eraser"></i>
        </Button>
        <Button
          variant="primary"
          onClick={handleSignatureSave}
          style={{
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <i className="bi bi-save"></i>
        </Button>
      </div>
    </div>
  </Modal.Body>
</Modal>

      {/* Photo Upload Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
          {photo && (
            <img
              src={URL.createObjectURL(photo)}
              alt="Leader"
              style={{ width: "100%", marginTop: "10px" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePhotoUpload}>
            Save Upload
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Phone Numbers Modal */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Phone Numbers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {phoneNumbers.length > 0 ? (
            <ul className="list-group">
              {phoneNumbers.map((num, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {num.contact_number}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePhoneNumber(num.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No phone numbers added.</p>
          )}
          <Form.Group className="mt-3">
            <Form.Control
              type="text"
              placeholder="Enter new phone number"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhoneModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddPhoneNumber}>
            Add Phone Number
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Leader Search Modal */}
      <Modal
        show={newLeaderModal}
        onHide={() => setNewLeaderModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tag New Leader</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewLeaderSearch}>
            <Form.Group className="mb-3">
              <Form.Label>Search Voter</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter name or voter ID"
                  value={newLeaderSearchInput}
                  onChange={(e) => setNewLeaderSearchInput(e.target.value)}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isNewLeaderLoading}
                >
                  {isNewLeaderLoading ? "Searching..." : "Search"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>
          {newLeaderSearchResults.length > 0 && (
            <div className="mt-3">
              <h6>Search Results:</h6>
              <div className="list-group">
                <Row>
                  <Col xs={12}>
                    {newLeaderSearchResults.map((result) => (
                      <div key={result.v_id}>
                        <div>
                          <strong>
                            {result.record_type === 2 ? (
                              <span className="text-danger text-decoration-line-through">
                                {result.fullname}
                              </span>
                            ) : (
                              result.fullname
                            )}
                          </strong>
                          <div className="text-muted small">
                            {result.address} | {result.bday}
                          </div>
                          {result.leaderHistory &&
                          result.leaderHistory.length > 0 ? (
                            <ul className="mt-1 mb-0 small ps-3">
                              {result.leaderHistory.map((history, index) => (
                                <li key={index}>
                                  🗳{" "}
                                  <strong>
                                    {history.electionyear}{" "}
                                    {GetType(history.type)}
                                  </strong>{" "}
                                  - Added on{" "}
                                  <em>
                                    {new Date(
                                      history.dateadded
                                    ).toLocaleDateString()}
                                  </em>{" "}
                                  {history.laynes !== null && (
                                    <span className="badge bg-warning text-dark ms-1">
                                      Laynes
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-muted small">
                              No leader history available
                            </div>
                          )}
                          {/* Instead of two dropdowns, we now have one Tag Leader button */}
                          <Row className="mt-2">
                            <Col xs={12}>
                              <Button
                                variant="outline-info"
                                className="w-100"
                                onClick={() => {
                                  setSelectedTagLeader(result);
                                  setTagCategory("cua"); // default selection
                                  setShowTagModal(true);
                                }}
                              >
                                Tag Leader
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    ))}
                  </Col>
                </Row>
              </div>
            </div>
          )}
          {newLeaderSearchResults.length === 0 && newLeaderSearchInput && (
            <div className="text-center mt-3 text-muted">
              No voters found matching "{newLeaderSearchInput}"
            </div>
          )}
          <Modal.Footer className="mt-2"></Modal.Footer>
        </Modal.Body>
      </Modal>

      {/* New Tag Leader Modal (New design) */}
      <Modal show={showTagModal} onHide={() => setShowTagModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Tag Leader: {selectedTagLeader && selectedTagLeader.fullname}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Toggle for Category */}
          <div className="mb-3 text-center">
            <Button
              variant={tagCategory === "cua" ? "primary" : "outline-primary"}
              onClick={() => setTagCategory("cua")}
            >
              Cua Leader
            </Button>
            <Button
              variant={tagCategory === "laynes" ? "primary" : "outline-primary"}
              onClick={() => setTagCategory("laynes")}
              className="ms-2"
            >
              Laynes Leader
            </Button>
          </div>
          {/* Leader Type Options */}
          <Row className="g-2">
            <Col xs={6}>
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  if (tagCategory === "cua") {
                    handleAddLeader(selectedTagLeader.v_id, 1);
                  } else {
                    handleAddLeaderLaynes(selectedTagLeader.v_id, 1);
                  }
                  setShowTagModal(false);
                }}
              >
                Ward Leader
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  if (tagCategory === "cua") {
                    handleAddLeader(selectedTagLeader.v_id, 4);
                  } else {
                    handleAddLeaderLaynes(selectedTagLeader.v_id, 4);
                  }
                  setShowTagModal(false);
                }}
              >
                Municipal Coordinator
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  if (tagCategory === "cua") {
                    handleAddLeader(selectedTagLeader.v_id, 2);
                  } else {
                    handleAddLeaderLaynes(selectedTagLeader.v_id, 2);
                  }
                  setShowTagModal(false);
                }}
              >
                Barangay Coordinator
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  if (tagCategory === "cua") {
                    handleAddLeader(selectedTagLeader.v_id, 3);
                  } else {
                    handleAddLeaderLaynes(selectedTagLeader.v_id, 3);
                  }
                  setShowTagModal(false);
                }}
              >
                District Coordinator
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Registration;

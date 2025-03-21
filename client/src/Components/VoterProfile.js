import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Image,
  Badge,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Accordion,
  ButtonGroup,
} from "react-bootstrap";
import { getIp, getUserId } from "./Vars";
import NewType from "./GetLeaderType";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import NewTag from "./NewTag";
import FBInputs from "./FacebookInputs";
import Modal from "react-bootstrap/Modal";
import { toast, Toaster } from "react-hot-toast";

const VoterProfile = ({ voter }) => {
  const [uploadsArray, setUploadsArray] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("1");
  const [facebookData, setFacebookData] = useState([]);
  const [remarksData, setRemarksData] = useState([]);
  const [fbData, setFbData] = useState([]);
  const [voterImg, setVoterImg] = useState(null);
  const [warding, setWarding] = useState([]);
  const [leader, setLeader] = useState([]);
  const [showEditbirthday, setShowEditBirthday] = useState(false);
  const [showMigrateData, setShowMigrateData] = useState(false);
  const [birthday, setBirthday] = useState();

  const [migrateSearchInput, setMigrateSearchInput] = useState("");
  const [migrateSearchResults, setMigrateSearchResults] = useState([]);
  const [isMigrateLoading, setIsMigrateLoading] = useState(false);

  const userId = getUserId();

  // Add these handler functions
  const handleMigrateSearch = async (e) => {
    e.preventDefault();
    if (!migrateSearchInput.trim()) return;

    setIsMigrateLoading(true);
    try {
      const response = await fetch(
        `${getIp()}/searchVoterMigrate?searchTxt=${migrateSearchInput}&address=${
          voter.address
        }`
      );
      const data = await response.json();
      setMigrateSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching voters");
    } finally {
      setIsMigrateLoading(false);
    }
  };

  const handleConfirmMigrate = async (targetVoterId) => {
 
      const confirmed = window.confirm(
        `Migrate data to/from voter ID ${targetVoterId}?`
      );

    if (!confirmed) return;

    let voterdata = {
      sourceVid: voter.v_id, // Default source = current voter
      targetVid: targetVoterId, // Default target = selected voter
      userId: getUserId(),
    };

    if (voter.record_type === 1) {
      voterdata = {
        // Flip direction when record_type=1
        sourceVid: targetVoterId, // Source becomes selected voter
        targetVid: voter.v_id, // Target becomes current voter
        userId: getUserId(),
      };
    }
    try {
      const response = await fetch(`${getIp()}/migrateData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voterdata),
      });

      if (response.ok) {
        toast.success("Data migrated successfully");
        setShowMigrateData(false);
        reloadAllData();
      } else {
        toast.error("Migration failed");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Error during migration");
    }
  };

  const fetchData = async (endpoint, setState) => {
    try {
      const response = await fetch(getIp() + endpoint);
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const reloadAllData = () => {
    setVoterImg(null);
    document.getElementById("fileInput").value = "";
    fetchData(`/getUploads?id=${voter.v_id}`, setUploadsArray);
    fetchData(`/getTags?id=${voter.v_id}`, setRemarksData);
    fetchData(`/getFb?id=${voter.v_id}`, setFbData);
    fetchData(`/getImg?id=${voter.v_id}`, setVoterImg);
    fetchData(`/getWarded?id=${voter.v_id}`, setWarding);
    fetchData(`/getLeader?id=${voter.v_id}`, setLeader);
  };

  useEffect(() => {
    reloadAllData();
  }, [voter.v_id]);

  const handleDeleteFb = async (fbid) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Facebook link?"
    );
    if (!confirmed) return;

    try {
      await fetch(`${getIp()}/deleteFB?fbid=${fbid}&uid=${userId}`, {
        method: "POST",
      });
      setFbData((prev) => prev.filter((fb) => fb.id !== fbid));
      reloadAllData();
    } catch (error) {
      console.error("Error deleting FB link:", error);
    }
  };

  const handleEditBirthday = async (vid) => {
    setShowEditBirthday(true);
  };

  const handleMigrateData = async (vid) => {
    setShowMigrateData(true);
  };

  const handleAddLeader = async (vid, leaderType) => {
    try {
      const response = await fetch(getIp() + "/saveLeader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vid,
          userId,
          leaderType, // Send the leader type (e.g., WL, MC, BC)
        }),
      });

      if (response.ok) {
        alert(`${leaderType} Leader Saved.`);
        reloadAllData();
      } else {
        console.log("Failed to save the leader due to errors");
      }
    } catch (error) {
      console.error("Error while saving the leader:", error);
      console.log("Error occurred while saving the leader");
    }
  };

  const handleAddLeaderLaynes = async (vid, leaderType) => {
    try {
      const response = await fetch(getIp() + "/saveLeaderLaynes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vid,
          userId,
          leaderType, // Send the leader type (e.g., WL, MC, BC)
        }),
      });

      if (response.ok) {
        alert(`${leaderType} Leader Saved.`);
        reloadAllData();
      } else {
        console.log("Failed to save the leader due to errors");
      }
    } catch (error) {
      console.error("Error while saving the leader:", error);
      console.log("Error occurred while saving the leader");
    }
  };

  const handleDeleteTag = async (remarksid, vid, remarks_txt) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tag?"
    );
    if (!confirmed) return;

    try {
      await fetch(
        `${getIp()}/deleteTag?tagid=${remarksid}&uid=${userId}&vid=${vid}&txt=${remarks_txt}`,
        { method: "POST" }
      );
      setRemarksData((prev) =>
        prev.filter((remark) => remark.v_remarks_id !== remarksid)
      );
      alert("Tag removed");
      reloadAllData();
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${getIp()}/savePic?id=${
          voter.v_id
        }&userid=${userId}&type=${uploadType}`,
        { method: "POST", body: formData }
      );
      if (response.ok) {
        alert("File upload successful");
        reloadAllData();
      } else {
        alert("Failed to upload the file due to errors");
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert("Error occurred while uploading the file");
    }
  };

  const handleSaveBirthday = async () => {
    // toast.success(voter.v_id);
    // toast.success(birthday);
    try {
      await fetch(
        `${getIp()}/saveBirthday?vid=${voter.v_id}&birthday=${birthday}`,
        { method: "POST" }
      );
      toast.success("Birthday updated");
      showEditbirthday(false);
    } catch (error) {
      console.error("Error saving birthday:", error);
    }
  };

  const handleDelete = (imgname) => {
    fetch(`${getIp()}/deletepic?vid=${voter.v_id}&imgname=${imgname}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        // if (data.success) {
        //   // Update the uploadsArray to remove the deleted image
        setUploadsArray((prev) =>
          prev.filter((item) => item.imgname !== imgname)
        );
        // }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    // console.log("DELETE" + imgname + voter.v_id)
  };

  const handleDeleteLeader = (id) => {
    if (window.confirm("Are you sure you want to delete this leader?")) {
      fetch(`${getIp()}/deleteLeader?vid=${id}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          // if (data.success) {
          //   // Update the uploadsArray to remove the deleted image
          reloadAllData();
          // }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      // console.log("DELETE" + imgname + voter.v_id)
      // Perform delete logic, e.g., updating state or calling an API
      console.log(`Deleting item with id: ${id}`);
      // Example: Update the state
      // setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  return (
    <>
      <Toaster />
      {voter && (
        <Card
          style={{
            overflowY: "auto",
            height: "91dvh",
            maxHeight: "91dvh",
            scrollbarWidth: "thin",
          }}
        >
          <CardBody>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Image
                src={
                  voterImg
                    ? voterImg.type !== 1
                      ? `${getIp()}/profiles/${voterImg.imgname}`
                      : `${getIp()}/profiles/${voter.v_idx}/${voterImg.imgname}`
                    : `${getIp()}/userprofiles/k.jpg`
                }
                roundedCircle
                width={100}
                height={100}
                style={{ border: "solid 3px #3A3B3C" }}
              />
              <div style={{ marginLeft: "20px" }}>
                <h5>
                  {/* {JSON.stringify(voter)} */}
                  {voter.record_type === 2 ? (
                    <>
                      <span className="text-danger text-decoration-line-through">
                        {voter.fullname}
                      </span>{" "}
                    </>
                  ) : (
                    <>{voter.fullname} </>
                  )}

                  <Button
                    variant="dark"
                    className="text-primary"
                    data-toggle="tooltip"
                    title="Reload data"
                    onClick={reloadAllData}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>

                  <Button
                    variant="dark"
                    className="text-info"
                    data-toggle="tooltip"
                    title={voter.record_type === 1 ? "Migrate from NICL data" : "Migrate to New Comelec Record"}
                    onClick={handleMigrateData}
                  >
                    <i className="bi bi-arrow-left-right"></i>
                  </Button>
                </h5>
                <span
                  style={{ fontSize: "12px" }}
                >{`${voter.address} ${voter.precinct}`}</span>
                <br />
                {/* {JSON.stringify(leader)} */}
                {leader.map((item, key) => (
                  <Badge
                    key={key}
                    bg="secondary"
                    style={{ marginRight: "10px", cursor: "pointer" }} // Add cursor pointer for click feedback
                    data-toggle="tooltip"
                    title="Leader"
                    onClick={() => handleDeleteLeader(item.id)} // Call the delete function
                  >
                    <i className="bi bi-person"></i>{" "}
                    {item.laynes == 1 && "Laynes"} {NewType(item.type)}{" "}
                    {item.electionyear}
                  </Badge>
                ))}
                {warding.map((item, key) => (
                  <Badge
                    key={key}
                    bg="secondary"
                    style={{ marginRight: "10px" }}
                    data-toggle="tooltip"
                    title="Warding"
                  >
                    <i className="bi bi-person-check"></i> {item.leader}{" "}
                    {item.electionyear}
                  </Badge>
                ))}
              </div>
            </div>
            <hr />
            <Tabs
              defaultActiveKey="home"
              id="uncontrolled-tab-example"
              className="mb-3"
            >
              <Tab eventKey="home" title="Profile">
                <Row>
                  <Col xl={5}>
                    <Row>
                      <Col xl={12}>
                        <Card>
                          <CardBody>
                            <h5 className="text-secondary mb-3">
                              Basic Info{" "}
                              <small
                                className="text-muted"
                                style={{ fontSize: "10px" }}
                              >
                                {"["}
                                {voter.v_id}
                                {"]"}
                              </small>
                            </h5>
                            <div className="details">
                              <p style={{ marginBottom: "5px" }}>
                                <i className="bi bi-cake"></i> Birthday -{" "}
                                {birthday ? (
                                  <>{birthday}</>
                                ) : (
                                  <>
                                    {voter.bday} | {voter.age}
                                  </>
                                )}
                                <>
                                  <Badge
                                    bg="primary"
                                    size="sm"
                                    style={{
                                      marginLeft: "10px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleEditBirthday(voter.v_id)
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Badge>
                                </>
                              </p>
                              {fbData.length > 0 && (
                                <p style={{ marginBottom: "5px" }}>
                                  {fbData[0].inactive == "1" && (
                                    <>
                                      <div>
                                        <i className="bi bi-facebook"></i> FB
                                        LINK UNAVAILABLE : INACTIVE
                                      </div>
                                      <Badge
                                        style={{
                                          marginLeft: "10px",
                                          cursor: "pointer",
                                        }}
                                        bg="danger"
                                        onClick={() =>
                                          handleDeleteFb(fbData[0].id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Badge>
                                    </>
                                  )}
                                  {fbData[0].locked == "1" && (
                                    <>
                                      <div>
                                        <i className="bi bi-facebook"></i> FB
                                        LINK UNAVAILABLE : LOCKED
                                      </div>
                                      <Badge
                                        style={{
                                          marginLeft: "10px",
                                          cursor: "pointer",
                                        }}
                                        bg="danger"
                                        onClick={() =>
                                          handleDeleteFb(fbData[0].id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Badge>
                                    </>
                                  )}
                                  {fbData[0].nofb == "1" && (
                                    <>
                                      <div>
                                        <i className="bi bi-facebook"></i> FB
                                        LINK UNAVAILABLE : NO FB
                                      </div>
                                      <Badge
                                        style={{
                                          marginLeft: "10px",
                                          cursor: "pointer",
                                        }}
                                        bg="danger"
                                        onClick={() =>
                                          handleDeleteFb(fbData[0].id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Badge>
                                    </>
                                  )}

                                  {fbData[0].facebook_id && (
                                    <>
                                      <a
                                        href={fbData[0].facebook_id}
                                        target="_blank"
                                      >
                                        View Facebook Profile
                                      </a>{" "}
                                      <Badge
                                        style={{
                                          marginLeft: "10px",
                                          cursor: "pointer",
                                        }}
                                        bg="danger"
                                        onClick={() =>
                                          handleDeleteFb(fbData[0].id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Badge>
                                    </>
                                  )}
                                  <div>
                                    <Badge bg="info" className="text-dark">
                                      {" "}
                                      RECORDED: {fbData[0].daterecorded}
                                    </Badge>
                                  </div>
                                </p>
                              )}
                              {/* {voter.contact.length > 0 && (
                                <p
                                  style={{ marginBottom: "5px" }}
                                  className="text-white"
                                >
                                  <i className="bi bi-phone"></i>{" "}
                                  {voter.contact.map((item, index) => (
                                    <React.Fragment key={index}>
                                      {item.contact_number}/
                                    </React.Fragment>
                                  ))}
                                </p>
                              )} */}
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xl={12}>
                        <Card className="mt-3">
                          <CardBody>
                            <h5 className="text-secondary">Upload</h5>
                            <Form onSubmit={handleFileUpload}>
                              <Form.Group
                                controlId="formFileSm"
                                className="mb-3 mt-3"
                              >
                                <Form.Control
                                  type="file"
                                  id="fileInput"
                                  size="sm"
                                  onChange={(e) =>
                                    setSelectedFile(e.target.files[0])
                                  }
                                />
                              </Form.Group>
                              <InputGroup className="mb-3">
                                <Form.Select
                                  aria-label="Default select example"
                                  className="mb-3"
                                  size="sm"
                                  value={uploadType}
                                  onChange={(e) =>
                                    setUploadType(e.target.value)
                                  }
                                >
                                  <option value="1">Profile</option>
                                  <option value="2">Media Files</option>
                                </Form.Select>
                                <Button
                                  variant="outline-secondary"
                                  className="mb-3"
                                  type="submit"
                                  size="sm"
                                >
                                  <i className="bi bi-upload"></i>
                                </Button>
                              </InputGroup>
                            </Form>
                          </CardBody>
                        </Card>
                        <Card className="mt-3">
                          <CardBody>
                            <FBInputs id={voter.v_id} />
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                  <Col xl={7}>
                    <Card>
                      <CardBody>
                        {/* Tagging Section */}
                        <h5 className="text-secondary mb-3">Tagging</h5>

                        {/* Accordion for Leadership Buttons */}
                        <Accordion defaultActiveKey="0" className="mb-3">
                          <Accordion.Item eventKey="0">
                            <Accordion.Header className="py-1">
                              <span className="text-secondary">
                                Leader Tags
                              </span>
                            </Accordion.Header>
                            <Accordion.Body className="pt-2 pb-1">
                              <div className="d-flex justify-content-center gap-2">
                                <ButtonGroup>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() =>
                                      handleAddLeader(voter.v_id, 1)
                                    }
                                  >
                                    WL 2025
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() =>
                                      handleAddLeader(voter.v_id, 4)
                                    }
                                  >
                                    MC 2025
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() =>
                                      handleAddLeader(voter.v_id, 2)
                                    }
                                  >
                                    BC 2025
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() =>
                                      handleAddLeader(voter.v_id, 3)
                                    }
                                  >
                                    DC 2025
                                  </Button>
                                </ButtonGroup>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                        <Accordion defaultActiveKey="0" className="mb-3">
                          <Accordion.Item eventKey="0">
                            <Accordion.Header className="py-1">
                              <span className="text-secondary">
                                Laynes Leader Tags
                              </span>
                            </Accordion.Header>
                            <Accordion.Body className="pt-2 pb-1">
                              <div className="d-flex justify-content-end gap-2">
                                <ButtonGroup>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleAddLeaderLaynes(voter.v_id, 1)
                                    }
                                  >
                                    Ward Leader
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleAddLeaderLaynes(voter.v_id, 4)
                                    }
                                  >
                                    Municipal Coordinator
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleAddLeaderLaynes(voter.v_id, 2)
                                    }
                                  >
                                    Barangay Coordinator
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleAddLeaderLaynes(voter.v_id, 3)
                                    }
                                  >
                                    District Coordinator
                                  </Button>
                                </ButtonGroup>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>

                        {/* New Tag Component */}
                        <NewTag id={voter.v_id} />

                        <hr />

                        {/* Remarks Section */}
                        <div
                          className="table-responsive"
                          style={{ maxHeight: "80vh" }}
                        >
                          <div
                            className="remarks-list"
                            style={{ maxHeight: "45vh" }}
                          >
                            {remarksData?.map((item, index) => (
                              <div
                                key={item.v_remarks_id}
                                className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom border-secondary"
                              >
                                <div>
                                  <i className="bi bi-tag me-2"></i>
                                  {item.remarks_txt}
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-muted p-0"
                                  onClick={() =>
                                    handleDeleteTag(
                                      item.v_remarks_id,
                                      voter.v_id,
                                      item.remarks_txt
                                    )
                                  }
                                >
                                  <i className="bi bi-x-lg"></i>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="profile" title="Files">
                {uploadsArray.length > 0 &&
                  uploadsArray.map((item, index) => (
                    <div key={index} className="upload-item">
                      <img
                        className="img-responsive p-3"
                        src={
                          !item.type
                            ? `${getIp()}/profiles/${item.imgname}` // If item.type is falsy, use the default image path
                            : `${getIp()}/profiles/${voter.v_id}/${
                                item.imgname
                              }`
                        }
                        width={400}
                        alt={item.imgname}
                      />

                      <img
                        className="img-responsive p-3"
                        src={
                          !item.type
                            ? `${getIp()}/profiles/${item.imgname}` // If item.type is falsy, use the default image path
                            : `${getIp()}/profiles/${voter.v_idx}/${
                                item.imgname
                              }`
                        }
                        width={400}
                        alt={item.imgname}
                      />
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item.imgname, item.type)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      )}
      <Modal
        show={showEditbirthday}
        onHide={() => setShowEditBirthday(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Birthday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewPin">
              <Form.Label>Select Birthday</Form.Label>
              <Form.Control
                type="text"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditBirthday(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSaveBirthday()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showMigrateData}
        onHide={() => setShowMigrateData(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Migrate Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMigrateSearch}>
            <Form.Group className="mb-3">
              <Form.Label>Search Voter to Migrate To</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter name or voter ID"
                  value={migrateSearchInput}
                  onChange={(e) => setMigrateSearchInput(e.target.value)}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isMigrateLoading}
                >
                  {isMigrateLoading ? "Searching..." : "Search"}
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>

          {migrateSearchResults.length > 0 && (
            <div className="mt-3">
              <h6>Search Results:</h6>
              <div
                className="list-group"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {migrateSearchResults.map((result) => (
                  <div
                    key={result.v_id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        {result.record_type === 2 ? (
                          <>
                            <span className="text-danger text-decoration-line-through">
                              {result.fullname}
                            </span>
                          </>
                        ) : (
                          <>{result.fullname}</>
                        )}
                      </strong>
                      <div className="text-muted small">
                        {result.address} | {result.v_id}
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleConfirmMigrate(result.v_id)}
                    >
                      {voter.record_type === 1
                        ? "Migrate From Here"
                        : "Migrate Here"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {migrateSearchResults.length === 0 && migrateSearchInput && (
            <div className="text-center mt-3 text-muted">
              No voters found matching "{migrateSearchInput}"
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VoterProfile;

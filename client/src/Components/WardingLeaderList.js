import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Form, Card, Accordion, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getIp } from "./Vars";
import { Toaster, toast } from "react-hot-toast";

const LeaderManagement = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  const [warding, setWarding] = useState([]);
  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");

  const [leaderSearch, setLeaderSearch] = useState(""); // For searching leaders
  const [memberSearch, setMemberSearch] = useState(""); // For searching members

  const handleMunicipalityChange = (event) => {
    const selectedMunicipality = event.target.value;
    setMunicipality(selectedMunicipality);

    fetch(getIp() + `/getBarangay?municipality=${selectedMunicipality}`)
      .then((response) => response.json())
      .then((data) => setBarangays(data))
      .catch((error) => console.error("Error on fetching barangays: " + error));
  };

  const handleBarangayChange = (event) => {
    setBarangay(event.target.value);
  };

  useEffect(() => {
    if (barangay) {
      fetch(
        getIp() +
          `/getwarding?mun=${municipality}&brgy=${barangay}&uid=${userId}`
      )
        .then((response) => response.json())
        .then((data) => setWarding(data))
        .catch((error) =>
          console.error("Error fetching warding data: " + error)
        );
    }
  }, [barangay, municipality, userId]);

  // Filter leaders by search input
  const filteredLeaders = warding.filter((leader) =>
    `${leader.leader_fname} ${leader.leader_lname}`
      .toLowerCase()
      .includes(leaderSearch.toLowerCase())
  );

  // Filter members by search input
  const filterMembers = (members) =>
    members.filter(
      (member) =>
        member.v_fname.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.v_lname.toLowerCase().includes(memberSearch.toLowerCase())
    );

  const deleteLeader = (leaderId) => {
    if (window.confirm("Are you sure you want to delete this leader?")) {
      fetch(`${getIp()}/deleteWarding`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leader_id: leaderId }), // Send the leader ID in the request body
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            toast.success("Leader deleted successfully!");
            setWarding((prevWarding) =>
              prevWarding.filter((leader) => leader.leader_id !== leaderId)
            );
          } else {
            toast.error("Failed to delete leader.");
          }
        })
        .catch((error) => toast.error("Error deleting leader."));
    }
  };

  const deleteMember = (memberId, leaderId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      fetch(`${getIp()}/deleteWardingMember`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: memberId }), // Send the member ID in the request body
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            toast.success("Member deleted successfully!");
            setWarding((prevWarding) =>
              prevWarding.map((leader) => {
                if (leader.leader_id === leaderId) {
                  return {
                    ...leader,
                    warding: leader.warding.filter(
                      (member) => member.warding_id !== memberId
                    ),
                  };
                }
                return leader;
              })
            );
          } else {
            toast.error("Failed to delete member.");
          }
        })
        .catch((error) => toast.error("Error deleting member."));
    }
  };

  return (
    <Container fluid="false" className="py-5 px-5">
      <Toaster />
      <Row className="justify-content-center align-items-center">
        <Col lg={8}>
          <Card className="p-3">
            <Card.Body
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
                    className="mb-3"
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
                <Col xl={6}>
                  <Form.Select
                    aria-label="Barangay"
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

              <Row className="mb-3">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Search Leader"
                    value={leaderSearch}
                    onChange={(e) => setLeaderSearch(e.target.value)}
                  />
                </Col>
              </Row>

              {/* Accordion for each leader */}
              <Accordion defaultActiveKey="0">
                {filteredLeaders.map((leader, index) => (
                  <Accordion.Item
                    eventKey={index.toString()}
                    key={leader.leader_id}
                  >
                    <Accordion.Header>
                      {index + 1}. {leader.leader_lname} {leader.leader_fname}{" "}
                      {leader.leader_mname} {" - "}
                      {(leader?.leader_type === "1" && "Ward Leader") ||
                        (leader?.leader_type === "2" &&
                          "Barangay Coordinator") ||
                        (leader?.leader_type === "3" &&
                          "District Coordinator") ||
                        (leader?.leader_type === "4" &&
                          "Municipal Coordinator")}
                    </Accordion.Header>
                    <Accordion.Body>
                      {filterMembers(leader.warding).length > 0 && (
                        <Button
                          variant="danger"
                          className="mb-3"
                          onClick={() => deleteLeader(leader.leader_id)}
                        >
                          Delete Warding
                        </Button>
                      )}
                      {filterMembers(leader.warding).length > 0 ? (
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Precinct No.</th>
                              <th>Last Name</th>
                              <th>First Name</th>
                              <th>Middle Name</th>
                              <th>Birthday</th>
                              <th>Gender</th>
                              <th>Record Type</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterMembers(leader.warding).map(
                              (member, index) => (
                                <tr key={member.warding_id}>
                                  <td>{index + 1}</td>
                                  <td>{member.v_precinct_no}</td>
                                  <td>{member.v_lname}</td>
                                  <td>{member.v_fname}</td>
                                  <td>{member.v_mname}</td>
                                  <td>
                                    {new Date(
                                      member.v_birthday
                                    ).toLocaleDateString()}
                                  </td>
                                  <td>{member.v_gender}</td>
                                  <td>
                                    {member.record_type === 1
                                      ? "Active"
                                      : "Inactive"}
                                  </td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      onClick={() =>
                                        deleteMember(
                                          member.warding_id,
                                          leader.leader_id
                                        )
                                      }
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      ) : (
                        <p className="text-muted text-center">
                          No matching members found.
                        </p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
                {filteredLeaders.length === 0 && (
                  <p className="text-muted text-center mt-3">
                    No matching leaders found.
                  </p>
                )}
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeaderManagement;

import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import "../App.css";
import { getIp } from "./Vars";
import { useNavigate } from "react-router-dom";

const OldWarding = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  const userData = sessionStorage.getItem("user");
  const parsedUserData = JSON.parse(userData);
  const userId = parsedUserData.user_id;

  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [voters, setVoters] = useState([]);
  const [leaderWarding, setLeaderWarding] = useState(null);
  const [searchVoters, setSearchVoters] = useState("");
  const [searchLeaders, setSearchLeaders] = useState(""); // New state for leader search
  const [loading, setLoading] = useState(false);

  const handleMunicipalityChange = async (event) => {
    const selectedMunicipality = event.target.value;
    setMunicipality(selectedMunicipality);
    setBarangays([]);
    setBarangay("");
    setLeaders([]);
    setVoters([]);
    setLeaderWarding(null);

    if (selectedMunicipality) {
      setLoading(true);
      try {
        const response = await fetch(
          getIp() + `/getBarangay?municipality=${selectedMunicipality}`
        );
        if (response.ok) {
          const data = await response.json();
          setBarangays(data);
        } else {
          console.error("Failed to fetch barangays:", response.statusText);
          setBarangays([]);
        }
      } catch (error) {
        console.error("Error fetching barangays:", error);
        setBarangays([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBarangayChange = async (event) => {
    const selectedBarangay = event.target.value;
    setBarangay(selectedBarangay);
    setLeaders([]);
    setVoters([]);
    setLeaderWarding(null);
    setLoading(true);

    if (selectedBarangay) {
      try {
        const leaderResponse = await fetch(
          getIp() +
            `/getLeaderWarding?municipality=${municipality}&barangay=${selectedBarangay}`
        );
        if (leaderResponse.ok) {
          const leaderData = await leaderResponse.json();
          setLeaders(leaderData);
        } else {
          console.error("Failed to fetch leaders:", leaderResponse.statusText);
          setLeaders([]);
        }

        const voterResponse = await fetch(
          getIp() +
            `/getVoters?municipality=${municipality}&barangay=${selectedBarangay}`
        );
        if (voterResponse.ok) {
          const voterData = await voterResponse.json();
          setVoters(voterData);
          setLoading(false);
        } else {
          console.error("Failed to fetch voters:", voterResponse.statusText);
          setVoters([]);
        }
      } catch (error) {
        console.error("Error fetching leaders or voters:", error);
        setLeaders([]);
        setVoters([]);
      }
    }
  };

  const handleRemoveMember = (memberId) => {
    if (leaderWarding) {
      // Remove member from leaderWarding's members array
      const updatedMembers = leaderWarding.members.filter(
        (member) => member.v_id !== memberId
      );
      setLeaderWarding((prev) => ({
        ...prev,
        members: updatedMembers,
      }));

      // Update the voter list to reflect the removed state
      setVoters((prevVoters) =>
        prevVoters.map((voter) =>
          voter.v_id === memberId
            ? { ...voter, addedToLeader: false } // Mark as not added
            : voter
        )
      );
    }
  };

  const handleLeaderClick = (leader) => {
    setLeaderWarding({
      leader,
      members: [],
    });
  };

  const handleAddMember = (voter) => {
    if (leaderWarding) {
      setLeaderWarding((prev) => ({
        ...prev,
        members: [...prev.members, voter],
      }));

      // Update the voter list to reflect the added state
      setVoters((prevVoters) =>
        prevVoters.map((v) =>
          v.v_id === voter.v_id ? { ...v, addedToLeader: true } : v
        )
      );
    }
  };
  const filteredLeaders = leaders.filter(
    (leader) =>
      leader.v_fname?.toLowerCase().includes(searchLeaders.toLowerCase()) ||
      leader.v_mname?.toLowerCase().includes(searchLeaders.toLowerCase()) ||
      leader.v_lname?.toLowerCase().includes(searchLeaders.toLowerCase())
  );

  const filteredVoters = voters.filter(
    (voter) =>
      voter.fname?.toLowerCase().includes(searchVoters.toLowerCase()) ||
      voter.mname?.toLowerCase().includes(searchVoters.toLowerCase()) ||
      voter.lname?.toLowerCase().includes(searchVoters.toLowerCase())
  );

  // Function to handle the Add to Leader button click and POST the leaderWarding data
  // Function to handle the Add to Leader button click and POST the leaderWarding data
  const handleAddToLeader = async () => {
    if (!leaderWarding || !leaderWarding.leader) {
      alert("Please select a leader before adding members.");
      return;
    }

    if (leaderWarding.members.length === 0) {
      alert("Please add members before assigning to leader.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        leader_id: leaderWarding.leader.v_id,
        members: leaderWarding.members.map((member) => member.v_id),
        municipality,
        barangay,
        userId,
      };

      const response = await fetch(getIp() + "/addLeaderWarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Leader Warding saved successfully!");

        // Mark all added members in the voter list
        const addedMemberIds = leaderWarding.members.map((m) => m.v_id);
        setVoters((prevVoters) =>
          prevVoters.map((v) =>
            addedMemberIds.includes(v.v_id)
              ? {
                  ...v,
                  addedToLeader: true,
                  warded: {
                    wardedCount: 1, // Assuming this is the first warded assignment
                    leader:
                      leaderWarding.leader.v_fname +
                      " " +
                      leaderWarding.leader.v_lname,
                  },
                }
              : v
          )
        );

        setLeaderWarding(null); // Reset leaderWarding after successful save
      } else {
        console.error("Failed to add leader warding:", response.statusText);
        alert("Failed to save Leader Warding.");
      }
    } catch (error) {
      console.error("Error saving leader warding:", error);
      alert("Error saving Leader Warding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid="false" className="py-5 poppins-regular px-5">
      <Row>
        <Col xl={3}>
          <Card className="p-4 limited-height-card">
            <h1>Leaders</h1>

            <Form>
              <Form.Group controlId="municipalitySelect" className="mb-3">
                <Form.Label>Municipality</Form.Label>
                <Form.Select
                  value={municipality}
                  onChange={handleMunicipalityChange}
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
              </Form.Group>

              <Form.Group controlId="barangaySelect" className="mb-3">
                <Form.Label>Barangay</Form.Label>
                <Form.Select
                  value={barangay}
                  onChange={handleBarangayChange}
                  disabled={!barangays.length || loading}
                >
                  <option value="">Select Barangay</option>
                  <option value="All">All Barangays</option>
                  {loading ? (
                    <option>Loading...</option>
                  ) : (
                    barangays.map((bgy, index) => (
                      <option key={index} value={bgy.barangay}>
                        {bgy.barangay}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="searchLeaders" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search leader"
                  value={searchLeaders}
                  onChange={(e) => setSearchLeaders(e.target.value)}
                />
              </Form.Group>
            </Form>

            {filteredLeaders.length > 0 ? (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaders.map((leader, index) => (
                    <tr key={index}>
                      <td>
                        <Button
                          variant="link"
                          onClick={() => handleLeaderClick(leader)}
                        >
                          {leader.v_fname} {leader.v_mname} {leader.v_lname}
                        </Button>
                      </td>
                      <td>
                        {
                          [
                            "Ward Leader",
                            "Barangay Coordinator",
                            "District Coordinator",
                            "Municipal Coordinator",
                          ][leader.type - 1]
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No leaders found.</p>
            )}
          </Card>
        </Col>

        {/* Voters Section */}
        <Col xl={6}>
          <Card className="p-4 limited-height-card">
            <h1>Voters</h1>
            <Form.Group controlId="searchVoters" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search voters"
                value={searchVoters}
                onChange={(e) => setSearchVoters(e.target.value)}
              />
            </Form.Group>
            {!loading ? (
              <>
                {/* {JSON.stringify(voters)} */}
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Leader</th>
                      <th>Birthday</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoters.length > 0 ? (
                      filteredVoters.map((voter, index) => {
                        const hasWardLeader =
                          voter.warded?.leader &&
                          voter.warded?.leader.trim() !== "";
                      
                          const hasHouseholdHead =
                          voter.withhousehold?.head_household &&
                          voter.withhousehold?.head_household.trim() !== "";
                   
                          // const isaLeader =
                          // voter.leader?.type &&
                          // voter.leader?.type.trim() !== "";

                        return (
                          <tr
                            key={index}
                            data-toggle="tooltip"
                            title={
                              hasWardLeader
                                ? `Ward Leader: ${voter.warded.leader}`
                                : hasHouseholdHead
                                ? `Household Head: ${voter.withhousehold.head_household}`
                                : ""
                            }
                          >
                            <td
                              className={`${
                                hasWardLeader || hasHouseholdHead
                                  ? "bg-danger text-white"
                                  : ""
                              }`}
                            >
                              {voter.lname}, {voter.fname} {voter.mname || ""}
                            </td>

                            <td
                              className={`${
                                hasWardLeader || hasHouseholdHead
                                  ? "bg-danger text-white"
                                  : ""
                              }`}
                            >
                              {voter.warded?.leader || ""}
                              {voter.withhousehold?.head_household || ""}
                              {(voter.leader?.type === 1 && "Ward Leader") ||
                                (voter.leader?.type === 2 &&
                                  "Barangay Coordinator") ||
                                (voter.leader?.type === 3 &&
                                  "District Coordinator") ||
                                (voter.leader?.type === 4 &&
                                  "Municipal Coordinator")}
                            </td>
                            <td
                              className={`${
                                hasWardLeader || hasHouseholdHead 
                                  ? "bg-danger text-white"
                                  : ""
                              }`}
                            >
                              {voter.bday
                                ? new Date(voter.bday).toLocaleDateString(
                                    "en-US"
                                  )
                                : "N/A"}
                            </td>
                            <td
                              className={`${
                                hasWardLeader || hasHouseholdHead 
                                  ? "bg-danger text-white"
                                  : ""
                              }`}
                            >
                              <Button
                                variant="primary"
                                onClick={() => handleAddMember(voter)}
                                disabled={
                                  // Disable if a leader is assigned
                                  hasWardLeader ||
                                  hasHouseholdHead ||
                                                         leaderWarding?.members.some(
                                    (m) => m.v_id === voter.v_id
                                  ) // Check if the voter is already in the leader's members
                                }
                              >
                                Add
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4">No voters found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </>
            ) : (
              <>Fetching list of voters of barangay {barangay} </>
            )}
          </Card>
        </Col>

        <Col xl={3}>
          {leaderWarding && (
            <Card className="p-4 limited-height-card">
              <h3>Leader Warding</h3>
              <p>
                <strong>Selected Leader: <br></br></strong> {leaderWarding.leader.v_fname}{" "}
                {leaderWarding.leader.v_mname} {leaderWarding.leader.v_lname}
              </p>
              <h5>Members:</h5>

              {leaderWarding.members.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fullname</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderWarding.members.map((member, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{member.lname}, {member.fname} {member.mname}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member.v_id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No members added yet.</p>
              )}

              {/* Add to Leader Button */}
              <Button
                variant="success"
                onClick={handleAddToLeader}
                disabled={loading || !leaderWarding.leader}
              >
                Add to Leader
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OldWarding;

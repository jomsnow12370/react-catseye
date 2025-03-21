import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Form, Container, Button, Table } from "react-bootstrap";
import { getIp } from "./Vars";

const WardingReport = () => {
  // const [municipality, setMunicipality] = useState("");
  // const [barangays, setBarangays] = useState([]);
  // const [barangay, setBarangay] = useState("");

  // const [warding, setWarding] = useState([]);
  // const [printOption, setPrintOption] = useState("full"); // Add state for print option
  // const printRef = useRef();
  // const printRef2 = useRef();

  // const fetchBarangays = async (municipality) => {
  //   if (!municipality) {
  //     setBarangays([]);
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       getIp() + `/getBarangay?municipality=${municipality}`
  //     );
  //     const data = await response.json();
  //     setBarangays(data);
  //   } catch (error) {
  //     console.error("Error fetching barangays:", error);
  //   }
  // };

  // const handleGenerateReport = async () => {
  //   try {
  //     const response = await fetch(
  //       getIp() +
  //         `/getwardingreport?mun=${municipality}&brgy=${barangay}`
  //     );
  //     const data = await response.json();
  //     setWarding(data);
  //   } catch (error) {
  //     console.error("Error generating report:", error);
  //   }
  // };

  // const handlePrint = () => {
  //   const printContent = printRef.current.innerHTML;
  //   const printContent2 = printRef2.current.innerHTML;

  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.open();
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Household Warding Report</title>
  //         <style>
  //           @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  //           body {
  //             font-family: 'Poppins', sans-serif;
  //           }
  //           table {
  //             width: 100%;
  //             border-collapse: collapse;
  //             font-family: 'Poppins',
  //           }
  //           table, th, td {
  //             border: 1px solid black;
  //             font-family: 'Poppins',
  //           }
  //           th, td {
  //             padding: 8px;
  //             text-align: left;
  //             font-family: 'Poppins',
  //           }
  //           @media print {
  //               footer {page-break-after: always;}
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <h3>Household Warding Report  ${new Date().toLocaleString()}</h3>
  //         <h4>${municipality}</h4>
  //         ${printOption === "summary" ? printContent2 : printContent} 
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  // const totalHeadsWithoutMembers = warding.filter(
  //   (ward) => ward.members.length === 0
  // ).length;

  // const householdsByBarangay = warding.reduce((acc, household) => {
  //   const { brgy } = household;
  //   if (!acc[brgy]) acc[brgy] = { warding: [], totalMembers: 0 };
  //   acc[brgy].warding.push(ward);
  //   acc[brgy].totalMembers += ward.members.length;
  //   return acc;
  // }, {});

  // // Total households and members across all barangays
  // const totalHouseholds = warding.length;
  // const totalMembers = warding.reduce(
  //   (sum, household) => sum + household.members.length,
  //   0
  // );

  // return (
  //   <Container className="mt-5">
  //     <h3>Household Warding Report</h3>
  //     <Row>
  //       <Col xl={5}>
  //         <Form.Select
  //           aria-label="Municipality"
  //           className="mb-3"
  //           onChange={(e) => {
  //             const selected = e.target.value;
  //             setMunicipality(selected);
  //             fetchBarangays(selected);
  //           }}
  //           value={municipality}
  //         >
  //           <option value="">Select Municipality</option>
  //           {[
  //             "BAGAMANOC",
  //             "BARAS",
  //             "BATO",
  //             "CARAMORAN",
  //             "GIGMOTO",
  //             "PANDAN",
  //             "PANGANIBAN",
  //             "SAN ANDRES",
  //             "SAN MIGUEL",
  //             "VIGA",
  //             "VIRAC",
  //           ].map((mun) => (
  //             <option key={mun} value={mun}>
  //               {mun}
  //             </option>
  //           ))}
  //         </Form.Select>
  //       </Col>
  //       <Col xl={5}>
  //         <Form.Select
  //           aria-label="Barangay"
  //           className="mb-3"
  //           onChange={(e) => {
  //             const brgy = e.target.value;
  //             setBarangay(brgy);
          
  //           }}
  //           value={barangay}
  //         >
  //           <option value="">Select Barangay</option>
  //           {barangays.map((brgy, index) => (
  //             <option key={index} value={brgy.barangay}>
  //               {brgy.barangay}
  //             </option>
  //           ))}
  //         </Form.Select>
  //       </Col>
  //              <Col xl={6}>
  //         <Button
  //           variant="primary"
  //           className="mt-1"
  //           onClick={handleGenerateReport}
  //         >
  //           Generate Report
  //         </Button>
  //         <Button
  //           variant="secondary"
  //           className="mt-1 ms-2"
  //           onClick={handlePrint}
  //         >
  //           Print Report
  //         </Button>
  //         <div className="mt-2">
  //           <Form.Check
  //             type="radio"
  //             label="Summary Only"
  //             checked={printOption === "summary"}
  //             onChange={() => setPrintOption("summary")}
  //           />
  //           <Form.Check
  //             type="radio"
  //             label="Full Report"
  //             checked={printOption === "full"}
  //             onChange={() => setPrintOption("full")}
  //           />
  //         </div>
  //       </Col>
  //     </Row>
  //     <Row>
  //       <Col xl={12} ref={printRef2} style={{ marginTop: "10px" }}>
  //         <Row className="mt-4">
  //           <Col>
  //             <Table striped bordered hover style={{ marginTop: "10px" }}>
  //               <thead>
  //                 <tr>
  //                   <th>#</th>
  //                   <th>Barangay</th>
  //                   <th>Head of Households</th>
  //                   <th>Members</th>
  //                   <th>Total</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 {Object.keys(householdsByBarangay).map((barangay, index) => {
  //                   const barangayData = householdsByBarangay[barangay];
  //                   return (
  //                     <tr key={index}>
  //                       <td>{index + 1}</td>
  //                       <td>{barangay}</td>
  //                       <td>{barangayData.households.length}</td>
  //                       <td>{barangayData.totalMembers}</td>
  //                       <td>
  //                         {barangayData.households.length +
  //                           barangayData.totalMembers}
  //                       </td>
  //                     </tr>
  //                   );
  //                 })}
  //                 {/* Overall total row */}
  //                 <tr>
  //                   <td colSpan={2}>
  //                     <strong>Total</strong>
  //                   </td>
  //                   <td>{totalHouseholds}</td>
  //                   <td>{totalMembers}</td>
  //                   <td>{totalHouseholds + totalMembers}</td>
  //                 </tr>
  //               </tbody>
  //             </Table>
  //           </Col>
  //         </Row>
  //       </Col>
  //       <Col xl={12} ref={printRef} style={{ marginTop: "10px" }}>
  //         <Row>
  //           <Col>
  //             {households.map((household, index) => (
  //               <React.Fragment key={index}>
  //                 {/* Table for Family Head */}
  //                 <Table striped bordered hover style={{ marginTop: "10px" }}>
  //                   <thead>
  //                     <tr>
  //                       <td>#</td>
  //                       <td>Family Head</td>
  //                       <td>Barangay</td>
  //                     </tr>
  //                   </thead>
  //                   <tbody>
  //                     <tr>
  //                       <td> {index + 1}</td>
  //                       <td>
  //                         <strong>{household.fh}</strong>
  //                       </td>
  //                       <td>{household.brgy}</td>
  //                     </tr>
  //                   </tbody>
  //                 </Table>
  //                 {/* Table for Members */}
  //                 <Table striped bordered hover style={{ marginTop: "10px" }}>
  //                   <thead>
  //                     <tr>
  //                       <th className="fw-bold text-center">#</th>
  //                       <th className="fw-bold">Family Member</th>
  //                       <th className="fw-bold">Barangay</th>
  //                     </tr>
  //                   </thead>
  //                   <tbody>
  //                     {household.members.length > 0 ? (
  //                       household.members.map((member, i) => (
  //                         <tr key={i}>
  //                           <td className="text-center">{i + 1}</td>
  //                           <td>{member.fullname}</td>
  //                           <td>{member.barangay}</td>
  //                         </tr>
  //                       ))
  //                     ) : (
  //                       <tr>
  //                         <td>&nbsp;</td>
  //                         <td style={{ color: "gray" }}>No member</td>
  //                         <td>&nbsp;</td>
                        
  //                       </tr>
  //                     )}
  //                     {/* Add two blank rows */}
  //                     <tr>
  //                       <td>&nbsp;</td>
  //                       <td>&nbsp;</td>
  //                       <td>&nbsp;</td>
      
  //                     </tr>
  //                     <tr>
  //                       <td>&nbsp;</td>
  //                       <td>&nbsp;</td>
  //                       <td>&nbsp;</td>
              
  //                     </tr>
  //                     {/* Row for Leader */}
  //                     <tr>
  //                       <td colSpan={3}>
  //                         <strong>Leader:</strong>{" "}
  //                         {household.leader.map((leader, i) => (
  //                           <span key={i}>{leader.fullname}</span>
  //                         ))}
  //                       </td>
  //                     </tr>
  //                   </tbody>
  //                 </Table>
  //               </React.Fragment>
  //             ))}
  //           </Col>
  //         </Row>
  //       </Col>
  //     </Row>
  //   </Container>
  // );
};

export default WardingReport;

const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const port = 3002;
const server = "localhost";
const user = "root"; //joms->server
const database = "v_list";

app.listen(port, () => {
  console.log("running on port " + port);
});

const db = mysql.createPool({
  host: server,
  user: user,
  password: "",
  database: database,
});

//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.query.id;
    const uploadPath = `./public/profiles/${id}`;

    // Check if the directory exists, create it if it doesn't
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Rename uploaded file (you can customize the filename as per your requirement)
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//multer
const storageUsers = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.query.id;
    const uploadPath = `./public/userprofiles`;

    // Check if the directory exists, create it if it doesn't
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Rename uploaded file (you can customize the filename as per your requirement)
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize multer upload
const upload = multer({
  storage: storage,
}).single("file"); // 'file' should match the name attribute in the FormData on the client side

const uploadUser = multer({
  storage: storageUsers,
}).single("file"); // 'file' should match the name attribute in the FormData on the client side

// Serve static files from the 'public' directory
app.use(express.static("public"));

function getCurrentDate() {
  let currentDate = new Date();
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1; // January is 0, so we add 1
  let year = currentDate.getFullYear();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  // Formatting the date to mm/dd/yyyy format
  let formattedDate;
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  formattedDate = year + "-" + month + "-" + day;

  // Formatting the time to HH:MM:SS format
  let formattedTime = hours + ":" + minutes + ":" + seconds;

  return {
    date: formattedDate,
    time: formattedTime,
  };
}

app.get("/get", (req, res) => {
  var id = req.query.id;

  try {
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getleaderwarding", (req, res) => {
  const mun = req.query.municipality;
  const brgy = req.query.barangay;
  try {
    // Build the SQL query dynamically based on the value of `brgy`
    let sql = `SELECT * FROM leaders 
               INNER JOIN v_info ON v_info.v_id = leaders.v_id 
               INNER JOIN barangays ON barangays.id = v_info.barangayId 
               WHERE municipality = '${mun}' AND electionyear = '2025' and laynes is null`;

    // Add the barangay condition only if `brgy` is not "All"
    if (brgy !== "All") {
      sql += ` AND barangay = '${brgy}'`;
    }

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      res.send(result);
      console.log(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getwarding", async (req, res) => {
  const mun = req.query.mun;
  const brgy = req.query.brgy;
  const userid = req.query.uid;

  try {
    // Build the SQL query dynamically for leaders
    let leaderQuery = `
    SELECT v_info.v_id as vid, v_lname, v_fname, v_mname, v_birthday, record_type, barangay, municipality, type
    FROM leaders 
    INNER JOIN v_info ON v_info.v_id = leaders.v_id 
    INNER JOIN barangays ON barangays.id = v_info.barangayId 
    WHERE municipality = '${mun}' AND electionyear = '2025' and laynes is null`;

    // Add the barangay condition only if `brgy` is not "All"
    if (brgy !== "All") {
      leaderQuery += ` AND barangay = '${brgy}'`;
    }

    // Add ORDER BY clause (e.g., order by last name in ascending order)
    leaderQuery += ` GROUP BY v_info.v_id ORDER BY type DESC, v_lname, v_mname ASC`;

    // // Add LIMIT clause (e.g., limit to 10 rows)
    // leaderQuery += ` LIMIT 10`;

    const results = await new Promise((resolve, reject) => {
      db.query(leaderQuery, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let membersArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.vid;
      const lname = result.v_lname;
      const fname = result.v_fname;
      const mname = result.v_mname;
      const bday = result.v_birthday;
      const brgy = result.barangay;
      const mun = result.municipality;
      const type = result.type;

      const wardedSql = `SELECT * from wardingtbl INNER JOIN v_info ON v_info.v_id = wardingtbl.member_v_id WHERE leader_v_id = '${v_id}' and electionyear = '2025'`;
      const warded = await new Promise((resolve, reject) => {
        db.query(wardedSql, (error, rRrms) => {
          if (error) {
            reject(error);
          } else {
            resolve(rRrms);
          }
        });
      });

      membersArr.push({
        leader_id: v_id,
        leader_fname: fname,
        leader_lname: lname,
        leader_mname: mname,
        leader_bday: bday,
        leader_brgy: brgy,
        leader_type: type,
        leader_mun: mun,
        warding: warded,
      });
    });

    await Promise.all(promises);
    // console.log(membersArr)
    res.send(membersArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to delete a leader
app.delete("/deleteWarding", (req, res) => {
  const { leader_id } = req.body;
  if (!leader_id) {
    return res
      .status(400)
      .json({ success: false, message: "Leader ID is required" });
  }

  const query = "DELETE FROM wardingtbl WHERE leader_v_id = ?";

  db.query(query, [leader_id], (err, result) => {
    if (err) {
      console.error("Error deleting leader:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete leader" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });
    }

    res.json({ success: true, message: "Leader deleted successfully" });
  });
});

// Endpoint to delete a member
app.delete("/deleteWardingMember", (req, res) => {
  const { member_id } = req.body;
  if (!member_id) {
    return res
      .status(400)
      .json({ success: false, message: "Member ID is required" });
  }

  const query = "DELETE FROM wardingtbl WHERE warding_id = ?";

  db.query(query, [member_id], (err, result) => {
    if (err) {
      console.error("Error deleting member:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete member" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, message: "Member deleted successfully" });
  });
});

app.get("/getLeader", (req, res) => {
  var id = req.query.id;

  try {
    const sql =
      "SELECT type, electionyear, id, laynes from leaders WHERE v_id = '" +
      id +
      "' AND status is null";
    db.query(sql, (error, result) => {
      // console.log("leader result: " + result + ' ' + id);
      // if(result.length === 0){
      //   console.log("no result");
      // }
      // else{
      //   console.log("with result");
      // }
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getleadersreport", async (req, res) => {
  var mun = req.query.mun;
  var brgy = req.query.brgy;
  var year = req.query.year;
  var type = req.query.type;
  var category = req.query.category;

  let munCondition = "";
  let brgyquery = "";
  let typeCondition = "";

  if (mun && mun !== "") {
    munCondition = ` AND municipality = '${mun}'`;
  }
  if (brgy && brgy !== "All") {
    brgyquery = ` AND barangay = '${brgy}' `;
  }
  // if (type && type !== "All") {
  //   // Only add the condition if type is not 'All'
  //   typeCondition = ` AND v_list.leaders.type = ${type} `;
  // }
  if (type && type !== "") {
    // Only add the condition if type is not 'All'
    if (type == "MC") {
      typeCondition = ` AND v_list.leaders.type = 4 `;
    } else if (type == "DC") {
      typeCondition = ` AND v_list.leaders.type = 3 `;
    } else if (type == "BC") {
      typeCondition = ` AND v_list.leaders.type = 2 `;
    } else if (type == "WL") {
      typeCondition = ` AND v_list.leaders.type = 1 `;
    }
  }

  if (category === "cua") {
    try {
      // Updated query to include type condition
      const sql = `SELECT barangay, municipality, v_fname, v_mname, v_lname, type, record_type
                         FROM v_list.leaders 
                         INNER JOIN v_info ON v_info.v_id = leaders.v_id 
                         INNER JOIN barangays ON barangays.id = v_info.barangayId 
                         WHERE electionyear = ${year} 
                          ${munCondition}
                          ${brgyquery}
                          ${typeCondition}
                           AND status is null AND laynes is null
                           AND record_type = 1
                         ORDER BY municipality, barangay, v_lname, v_mname`;

      db.query(sql, (error, result) => {
        if (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }
        console.log(sql);
        res.send(result);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (category === "laynes") {
    const sql = `SELECT barangay, municipality, v_fname, v_mname, v_lname, type, record_type
    FROM v_list.leaders 
    INNER JOIN v_info ON v_info.v_id = leaders.v_id 
    INNER JOIN barangays ON barangays.id = v_info.barangayId 
    WHERE electionyear = ${year} 
     ${munCondition}
    ${brgyquery}
      ${typeCondition}
      
      AND status is null AND laynes is not null
      AND record_type = 1
    ORDER BY municipality, barangay, v_lname, v_mname`;

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      res.send(result);
    });
  } else if (category === "cua-laynes") {
    try {
      // Updated query to include type condition
      const sql = `SELECT barangay, municipality, v_fname, v_mname, v_lname, type, record_type
                         FROM v_list.leaders 
                         INNER JOIN v_info ON v_info.v_id = leaders.v_id 
                         INNER JOIN barangays ON barangays.id = v_info.barangayId 
                         WHERE electionyear = ${year} 
                          ${munCondition}
                          ${brgyquery}
                          ${typeCondition}
                           AND status is null
                           AND record_type = 1
                           GROUP BY leaders.v_id
                         ORDER BY municipality, barangay, v_lname, v_mname`;

      db.query(sql, (error, result) => {
        if (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }
        console.log(sql);
        res.send(result);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// app.get("/getleadersreport", (req, res) => {
//   var mun = req.query.mun;
//   var brgy = req.query.brgy;
//   var year = req.query.year;
//   var type = req.query.type; // Get the selected type

//   let typeCondition = "";
//   let brgyquery = "";

//   if (brgy && brgy !== "All") {
//     brgyquery = ` AND barangay = '${brgy}' `;
//   }

//   if (type && type !== "All") {
//     // Only add the condition if type is not 'All'
//     typeCondition = `AND leaders.type = '${type}'`;
//   }

//   try {
//     // Main query to fetch leaders data
//     const sql = `SELECT barangay, municipality, v_fname, v_mname, v_lname, type, record_type
//                  FROM v_list.leaders
//                  INNER JOIN v_info ON v_info.v_id = leaders.v_id
//                  INNER JOIN barangays ON barangays.id = v_info.barangayId
//                  WHERE electionyear = ${year}
//                    AND municipality = '${mun}'
//                    ${brgyquery}
//                    ${typeCondition}  -- Apply the type filter dynamically
//                    AND status is null
//                  GROUP BY v_info.v_id
//                  ORDER BY barangay, v_lname, v_mname`;

//     db.query(sql, (error, result) => {
//       if (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//         return;
//       }

//       let finalResult = [];

//       // Loop through each leader to perform additional queries
//       result.forEach((leader) => {
//         // Additional query for each leader
//         const leaderId = leader.v_id;

//         const additionalSql = `SELECT other_column1, other_column2 FROM some_table WHERE leader_id = ${leaderId}`;

//         db.query(additionalSql, (err, additionalResult) => {
//           if (err) {
//             console.error("Error fetching additional data:", err);
//             return;
//           }

//           // Merge the additional data with the leader data
//           const leaderWithAdditionalData = {
//             ...leader,
//             additionalData: additionalResult, // Include the data from the second query
//           };

//           finalResult.push(leaderWithAdditionalData);

//           // Send response once all the data is processed
//           if (finalResult.length === result.length) {
//             res.send(finalResult); // Send the final array of data after processing all leaders
//           }
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

app.get("/getWarded", (req, res) => {
  var id = req.query.id;

  try {
    const sql =
      "SELECT leader_v_id as leaderid, (SELECT CONCAT(v_lname, ', ',  v_fname, ' ',v_mname) from v_info WHERE v_id = leaderid) as leader, electionyear from wardingtbl WHERE member_v_id = '" +
      id +
      "'";
    db.query(sql, (error, result) => {
      // console.log("warded result: " + result + ' ' + id);
      // if(result.length === 0){
      //   console.log("no result");
      // }
      // else{
      //   console.log("with result");
      // }
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getData", (req, res) => {
  var id = req.query.id;

  try {
    const sql =
      "SELECT v_info.v_id as vid, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, CONCAT(v_fname, ' ', v_lname, ' ', v_mname) as fullname2, CONCAT(v_barangay, ', ', v_municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no from v_info WHERE v_id = '" +
      id +
      "'";
    db.query(sql, (error, result) => {
      //console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getTags", (req, res) => {
  var id = req.query.id;

  try {
    const sql =
      "SELECT remarks_txt, v_remarks_id from v_remarks INNER JOIN quick_remarks on quick_remarks.remarks_id = v_remarks.remarks_id LEFT JOIN qr_category ON qr_category.category_id = quick_remarks.category_id WHERE v_id = '" +
      id +
      "' ORDER BY v_remarks_id ASC";
    db.query(sql, (error, result) => {
      //console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getFb", (req, res) => {
  var id = req.query.id;

  try {
    const sql = "SELECT * FROM facebook WHERE v_id = '" + id + "'";
    db.query(sql, (error, result) => {
      //console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getImg", (req, res) => {
  var id = req.query.id;
  try {
    const img =
      "SELECT imgname, type from v_imgtbl WHERE v_id = '" +
      id +
      "' AND (type is null or type = '1') ORDER BY id DESC LIMIT 1";

    db.query(img, (error, result) => {
      if (result) {
        res.send(result[0]);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getUploads", (req, res) => {
  var id = req.query.id;
  try {
    const img =
      "SELECT imgname, type, v_idx from v_imgtbl INNER JOIN v_info ON v_info.v_id = v_imgtbl.v_id  WHERE v_imgtbl.v_id = '" +
      id +
      "'";

    db.query(img, (error, result) => {
      if (result) {
        res.send(result);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// app.get("/searchVoter", async (req, res) => {
//   try {
//     var name = req.query.searchTxt;
//     var brgy = "";
//     var mun = "";
//     var searchTxt = "";

//     // Splitting the string by comma

//     // Extracting variables
//     if (name.includes(",") == true) {
//       var splitStrings = name.split(",");

//       searchTxt = splitStrings[0].trim();
//       brgy = splitStrings[1].trim();
//       mun = splitStrings[2].trim();
//     } else {
//       searchTxt = req.query.searchTxt;
//     }

//     if (!brgy) {
//       brgy = "";
//     }

//     // Checking if mun is undefined or empty
//     if (!mun) {
//       mun = "";
//     }
//     try {
//       const sql =
//         "SELECT v_id from v_info WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
//         searchTxt +
//         "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
//         searchTxt +
//         "%') AND v_municipality LIKE '%" +
//         mun +
//         "%' AND v_barangay LIKE '%" +
//         brgy +
//         "%' LIMIT 1000";
//       // AND TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) BETWEEN 0 and 45
//       db.query(sql, (error, result) => {
//         if (error) {
//           console.error("Error fetching data:", error);
//         } else {
//           res.send(result);
//         }
//       });
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   } catch (error) {
//     console.log("error format");
//   }
// });

app.post("/savePic", (req, res) => {
  const id = req.query.id;
  const uid = req.query.userid;

  const type = req.query.type;

  const datestring = getCurrentDate();
  var datenow = datestring.date + " " + datestring.time;

  upload(req, res, async (err) => {
    if (err) {
      // Handle upload error
      console.error(err);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    // File uploaded successfully
    // console.log(req.file); // Contains information about the uploaded file
    // console.log(req.body.id); // Contains the value of 'id' field sent along with the file

    // Save file name in MySQL database

    const filename = req.file.filename;

    const query =
      "INSERT INTO v_imgtbl (v_id, imgname, type, daterecorded, user_id) VALUES ('" +
      id +
      "', '" +
      filename +
      "', '" +
      type +
      "', '" +
      datenow +
      "','" +
      uid +
      "')";
    // console.log(query);
    await db.query(query, function (err, result) {
      if (err) throw err;
      //console.log("File name saved in database:", filename);
      // console.log(result);
      res.status(200).json({ message: "File uploaded successfully" });
    });
  });
});

app.post("/saveFB", async (req, res) => {
  try {
    const id = req.query.id;
    const fblink = req.query.fblink;
    const uid = req.query.uid;
    const fbtype = req.query.fbtype;

    var nofb = 0;
    var locked = 0;
    var inactive = 0;
    var newfblink = "";

    if (fbtype == 2) {
      nofb = 1;
    }
    if (fbtype == 3) {
      inactive = 1;
    }
    if (fbtype == 4) {
      locked = 1;
    }

    const datestring = getCurrentDate();
    var datenow = datestring.date + " " + datestring.time;

    try {
      const query =
        "INSERT INTO facebook (v_id, nofb, locked, inactive, facebook_id, daterecorded, user_id) VALUES ('" +
        id +
        "','" +
        nofb +
        "','" +
        locked +
        "','" +
        inactive +
        "','" +
        fblink +
        "','" +
        datenow +
        "','" +
        uid +
        "')";
      db.query(query, function (err, result) {
        if (err) throw err;
        //console.log("File name saved in database:", filename);
        // console.log(result);
        res.send(result);
      });
    } catch (error) {
      res.send(error);
    }
    // if (fblink) {

    // await saveLog(uid, "recorded facebook profile " + fblink, id);
    // }
  } catch (error) {}
});

app.post("/deleteFB", async (req, res) => {
  const fbid = req.query.fbid;
  const uid = req.query.uid;
  // console.log(fbid)

  const query = "DELETE from facebook WHERE id = '" + fbid + "'";

  db.query(query, function (err, result) {
    if (err) throw err;
    //console.log("File name saved in database:", filename);
    // console.log(result);
    // console.log(query);
    res.send(result);
  });
});

app.post("/deleteTag", async (req, res) => {
  const tagid = req.query.tagid;
  const uid = req.query.uid;
  const vid = req.query.vid;
  const txt = req.query.txt;
  // console.log(fbid)

  const query = "DELETE from v_remarks WHERE v_remarks_id = '" + tagid + "'";

  db.query(query, function (err, result) {
    if (err) throw err;
    // //console.log("File name saved in database:", filename);
    // // console.log(result);
    // console.log(query);
    //saveLog(uid, "removed tag " + txt, vid);
    res.send(result);
  });
});

app.delete("/deleteCreatedTag", (req, res) => {
  const tagid = req.query.tagid; // ID of the tag to delete
  const uid = req.query.uid; // User ID (optional, for logging)
  const vid = req.query.id; // Record or voter ID
  const txt = req.query.txt; // Optional text parameter

  // Validate required parameters
  if (!tagid || !vid) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Use parameterized query to avoid SQL injection
  const query = "DELETE FROM v_remarks WHERE remarks_id = ? AND v_id = ?";
  db.query(query, [tagid, vid], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    // Optionally, log the deletion:
    // saveLog(uid, "removed tag " + txt, vid);
    res.json(result);
  });
});

// Login route
app.get("/login", (req, res) => {
  const userName = req.query.userName;
  const password = req.query.password;

  const query =
    "SELECT user_id, fname, user_type FROM userstbl WHERE username = ? AND password = ?";

  db.query(query, [userName, password], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    res.json(user); // Send user data
  });
});

// Logout route
app.get("/logout", (req, res) => {
  // Destroy session
  req.session.destroy();
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

app.get("/facebookss", function (req, res) {
  // if (req.session.test) {
  //   res.send(req.session.test);
  // } else {
  //   console.log("NO USER SESSION");
  //   res.send("NO USER SESSION");
  // }
  try {
    const sql =
      "SELECT COUNT(distinct(event)) as totalfb, (SELECT COUNT(distinct(event))FROM v_list.userlogs WHERE " +
      query +
      " AND event like '%no%') as nofb, (SELECT COUNT(distinct(event))FROM v_list.userlogs WHERE " +
      query +
      " AND event like '%inactive%') as inactive, (SELECT COUNT(distinct(event))FROM v_list.userlogs WHERE " +
      query +
      " AND event like '%locked%') as locked FROM v_list.userlogs WHERE " +
      query +
      " AND event like '%http%'";
    db.query(sql, (error, result) => {
      console.log(datefrom);
      console.log(dateto);
      console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//getdatetime
// function saveLog(userid, event, vid) {
//   const datestring = getCurrentDate();
//   // "27-11-2020"

//   // Format the date and time according to the options

//   const query =
//     "INSERT INTO userlogs (user_id, logtime, event, v_id) VALUES ('" +
//     userid +
//     "', '" +
//     datestring.date +
//     " " +
//     datestring.time +
//     "','" +
//     (event + " --reactjs") +
//     "','" +
//     vid +
//     "')";
//   db.query(query, function (err, result) {
//     if (err) throw err;
//     console.log(result);
//   });
// }

app.get("/logs", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(daterecorded) between '" + datefrom + "' and '" + dateto + "'";
  try {
    const sql =
      "SELECT COUNT(*) AS totalfb, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND nofb = 1) AS nofb, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND inactive = 1) AS inactive, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND locked = 1) AS locked FROM facebook WHERE " +
      query +
      " AND nofb = 0 AND inactive = 0 AND locked = 0";
    db.query(sql, (error, result) => {
      // console.log(datefrom);
      // console.log(dateto);
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/wardinglogs", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(date_saved) between '" + datefrom + "' and '" + dateto + "'";
  try {
    const sql =
      "SELECT COUNT(*) AS headhousehold, (SELECT COUNT(*) FROM household_warding WHERE " +
      query +
      ") AS members FROM head_household WHERE " +
      query +
      "";
    db.query(sql, (error, result) => {
      // console.log(datefrom);
      // console.log(dateto);
      console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getDq", (req, res) => {
  const uid = req.query.uid;
  const datestring = getCurrentDate();
  var date = datestring.date;

  try {
    const sql =
      "SELECT COUNT(*) as cnt from facebook WHERE DATE(daterecorded) = '" +
      date +
      "' AND user_id = '" +
      uid +
      "'";

    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getWardingDq", (req, res) => {
  const uid = req.query.uid;
  const datestring = getCurrentDate();
  var date = datestring.date;

  try {
    const sql =
      "SELECT COUNT(*) as cnt from head_household WHERE DATE(date_saved) = '" +
      date +
      "' AND user_id = '" +
      uid +
      "'";

    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/userlogs", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(daterecorded) between '" + datefrom + "' and '" + dateto + "'";

  try {
    const sql =
      "SELECT fname, COUNT(*) AS totalfb, facebook.user_id as uid, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND nofb = 1 and user_id = uid) AS nofb, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND inactive = 1 and user_id = uid) AS inactive, (SELECT COUNT(*) from facebook WHERE " +
      query +
      " AND locked = 1 and user_id = uid) AS locked, userstbl.imgname as img FROM facebook INNER JOIN userstbl ON userstbl.user_id = facebook.user_id WHERE " +
      query +
      " AND nofb = 0 AND inactive = 0 AND locked = 0 GROUP BY facebook.user_id ORDER BY totalfb DESC";

    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/wardinguserlogs", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(date_saved) between '" + datefrom + "' and '" + dateto + "'";

  try {
    const sql =
      "SELECT userstbl.user_id as xid, fname,  COUNT(*) AS headhousehold, (SELECT COUNT(*) FROM household_warding WHERE " +
      query +
      " AND household_warding.user_id = xid) AS members, userstbl.imgname as img FROM head_household INNER JOIN userstbl ON userstbl.user_id = head_household.user_id WHERE " +
      query +
      " GROUP BY head_household.user_id ORDER BY COUNT(*) DESC";

    db.query(sql, (error, result) => {
      console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/events", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(daterecorded) between '" + datefrom + "' and '" + dateto + "'";
  try {
    const sql =
      "SELECT fname, event, logtime from userlogs INNER JOIN userstbl ON userstbl.user_id = userlogs.user_id WHERE " +
      query +
      " ORDER BY ID DESC LIMIT 20";
    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/addTag", async (req, res) => {
  const id = req.query.id;
  const tag = req.query.tag;
  const uid = req.query.uid;
  const datestring = getCurrentDate();
  var datenow = datestring.date + " " + datestring.time;

  try {
    const query =
      "INSERT INTO v_remarks (v_id, remarks_id, dateRecorded, recordedBy) VALUES ('" +
      id +
      "'," +
      tag +
      ",'" +
      datenow +
      "','" +
      uid +
      "')";
    try {
      db.query(query, function (err, result) {
        // if (err) throw err;
        //console.log("File name saved in database:", filename);
        // console.log(result);
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/getAllTags", (req, res) => {
  try {
    const sql =
      "SELECT remarks_id, shortcut_txt, remarks_txt, category_name from quick_remarks LEFT JOIN qr_category ON qr_category.category_id = quick_remarks.category_id WHERE qr_category.show = '1' ORDER BY shortcut_txt";
    db.query(sql, (error, result) => {
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getCustomTags", (req, res) => {
  try {
    const sql =
      "SELECT remarks_id, shortcut_txt, remarks_txt, category_name from quick_remarks LEFT JOIN qr_category ON qr_category.category_id = quick_remarks.category_id WHERE qr_category.show = '0' ORDER BY shortcut_txt";
    db.query(sql, (error, result) => {
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/test", (req, res) => {
  res.write("Hello world");
});

//searchtag
app.get("/searchTag", (req, res) => {
  const searchtag = req.query.tag;
  try {
    const sql =
      "SELECT remarks_id, shortcut_txt, remarks_txt, category_name from quick_remarks LEFT JOIN qr_category ON qr_category.category_id = quick_remarks.category_id WHERE (remarks_txt LIKE '%" +
      searchtag +
      "%' OR shortcut_txt LIKE '%" +
      searchtag +
      "%') ORDER BY shortcut_txt LIMIT 15";
    db.query(sql, (error, result) => {
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching in gettags:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/searchVoter", async (req, res) => {
  try {
    var name = req.query.searchTxt.trim();

    if (name == "*") {
      name = "";
    }

    var brgy = req.query.brgy;
    var mun = req.query.mun;
    var limit = req.query.limit;

    // Splitting the string by comma

    // Extracting variables
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  if (name.includes("facebook")) {
    function getLastPartOfURL(url) {
      // Split the URL by '/' and return the last non-empty part
      return url.split("/").filter(Boolean).pop();
    }
    // console.log("facebook search");
    try {
      // Prepare combinations of name arrangements
      const sql = ` 
SELECT v_info.v_id as id, v_idx, CONCAT_WS(' ', v_lname, v_fname, v_mname) AS fullname, CONCAT(barangay, ', ', municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no
FROM 
  v_info 
INNER JOIN 
  facebook ON facebook.v_id = v_info.v_id 
INNER JOIN 
  barangays ON barangays.id = v_info.barangayId 
WHERE 
  facebook_id LIKE '%${getLastPartOfURL(name)}%' ORDER BY 
  municipality, barangay, v_lname, v_mname, v_fname 
LIMIT ${limit};
`;

      const results = await new Promise((resolve, reject) => {
        db.query(sql, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });

      let votersArr = [];

      const promises = results.map(async (result) => {
        const v_id = result.id;
        const fullname = result.fullname;
        const address = result.address;
        const bday = result.v_birthday;
        const age = result.age;
        const record_type = result.record_type;
        const precinct = result.v_precinct_no;
        const v_idx = result.v_idx;
        const imgSql =
          "SELECT imgname,type from v_imgtbl WHERE v_id = '" +
          v_id +
          "' ORDER BY ID desc LIMIT 1";
        const vImg = await new Promise((resolve, reject) => {
          db.query(imgSql, (error, rRrms) => {
            if (error) {
              reject(error);
            } else {
              resolve(rRrms);
            }
          });
        });

        votersArr.push({
          v_id: v_id,
          fullname: fullname,
          address: address,
          bday: bday,
          record_type: record_type,
          // supporter: supporter,
          age: age,
          precinct: precinct,
          vImg: vImg,
          v_idx: v_idx,
        });
      });

      await Promise.all(promises);

      res.send(votersArr);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // console.log("not fb search");
    let brgyquery = "";
    if (brgy !== "") {
      brgyquery = `AND barangay = '${brgy}'`;
    }

    let munquery = "";
    if (mun !== "") {
      munquery = `AND municipality = '${mun}'`;
    }
    try {
      const sql = `
      SELECT v_info.v_id as id, v_idx, 
             CONCAT_WS(' ', v_lname, v_fname, v_mname) AS fullname, 
             CONCAT(barangay, ', ', municipality) AS address, 
             DATE_FORMAT(v_birthday, '%b. %d, %Y') AS v_birthday, 
             record_type, 
             TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, 
             v_precinct_no 
      FROM v_info 
      INNER JOIN barangays ON barangays.id = v_info.barangayId 
      WHERE (
        CONCAT_WS(' ', v_lname, v_fname, v_mname) LIKE '%${name}%' OR 
        CONCAT_WS(' ', v_fname, v_lname, v_mname) LIKE '%${name}%' OR 
        CONCAT_WS(' ', v_fname, v_mname, v_lname) LIKE '%${name}%' OR 
        CONCAT_WS(' ', v_mname, v_fname, v_lname) LIKE '%${name}%' OR 
        CONCAT_WS(' ', v_mname, v_lname, v_fname) LIKE '%${name}%' OR 
        CONCAT_WS(' ', v_lname, v_mname, v_fname) LIKE '%${name}%'
      ) 
      ${munquery} ${brgyquery}
      ORDER BY barangayId, v_lname, v_mname, v_fname 
      LIMIT ${limit};
    `;

      const results = await new Promise((resolve, reject) => {
        db.query(sql, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });

      let votersArr = [];

      const promises = results.map(async (result) => {
        const v_id = result.id;
        const fullname = result.fullname;
        const address = result.address;
        const bday = result.v_birthday;
        const age = result.age;
        const record_type = result.record_type;
        const precinct = result.v_precinct_no;
        const v_idx = result.v_idx;
        const imgSql =
          "SELECT imgname,type from v_imgtbl WHERE v_id = '" +
          v_id +
          "' ORDER BY ID desc LIMIT 1";
        const vImg = await new Promise((resolve, reject) => {
          db.query(imgSql, (error, rRrms) => {
            if (error) {
              reject(error);
            } else {
              resolve(rRrms);
            }
          });
        });

        votersArr.push({
          v_id: v_id,
          fullname: fullname,
          address: address,
          bday: bday,
          record_type: record_type,
          // supporter: supporter,
          age: age,
          precinct: precinct,
          vImg: vImg,
          v_idx: v_idx,
        });
      });

      await Promise.all(promises);

      res.send(votersArr);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

app.get("/searchVoterMigrate", async (req, res) => {
  try {
    var name = req.query.searchTxt.trim();
    var address = req.query.address.trim();
    // Splitting the string by comma
    // Extracting variables
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  try {
    const sql =
      "SELECT v_info.v_id as id, v_idx, CONCAT(v_lname, ' ', v_fname, ' ', v_mname) as fullname, CONCAT(barangay, ', ', municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
      name +
      "%') AND CONCAT(barangay, ', ', municipality) = '" +
      address +
      "' ORDER BY municipality, barangay, v_lname, v_mname, v_fname LIMIT 50";

    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let votersArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.id;
      const fullname = result.fullname;
      const address = result.address;
      const bday = result.v_birthday;
      const age = result.age;
      const record_type = result.record_type;
      const precinct = result.v_precinct_no;

      votersArr.push({
        v_id: v_id,
        fullname: fullname,
        address: address,
        bday: bday,
        record_type: record_type,
        age: age,
        precinct: precinct,
      });
    });

    await Promise.all(promises);
    // console.log(votersArr)
    res.send(votersArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/searchVoterNewLeader", async (req, res) => {
  try {
    var name = req.query.searchTxt.trim();
    var municipality = req.query.municipality.trim();
    var barangay = req.query.barangay.trim();

    // Splitting the string by comma

    // Extracting variables
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  try {
    let brgyquery = "";
    if (barangay !== "") {
      brgyquery = `AND barangay = '${barangay}'`;
    }

    const sql =
      "SELECT v_info.v_id as id, v_idx, CONCAT(v_lname, ' ', v_fname, ' ', v_mname) as fullname, CONCAT(barangay, ', ', municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
      name +
      "%') AND municipality = '" +
      municipality +
      "'" +
      brgyquery +
      " ORDER BY municipality, barangay, v_lname, v_mname, v_fname LIMIT 50";

    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let votersArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.id;
      const fullname = result.fullname;
      const address = result.address;
      const bday = result.v_birthday;
      const age = result.age;
      const record_type = result.record_type;
      const precinct = result.v_precinct_no;

      const leaderHistorySql = `SELECT * from leaders WHERE v_id = ${v_id} and status is null`;

      const leaderHistory = await new Promise((resolve, reject) => {
        db.query(leaderHistorySql, (error, rRrms) => {
          if (error) {
            reject(error);
          } else {
            resolve(rRrms);
          }
        });
      });

      votersArr.push({
        v_id: v_id,
        fullname: fullname,
        address: address,
        bday: bday,
        record_type: record_type,
        age: age,
        precinct: precinct,
        leaderHistory: leaderHistory,
      });
    });

    await Promise.all(promises);
    // console.log(votersArr)
    res.send(votersArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/search", async (req, res) => {
  try {
    var name = req.query.searchTxt.trim();

    if (name == "*") {
      name = "";
    }

    var brgy = req.query.brgy;
    var mun = req.query.mun;

    // Splitting the string by comma

    // Extracting variables
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  try {
    const sql =
      "SELECT v_info.v_id as id, v_idx, CONCAT(v_lname, ' ', v_fname, ' ', v_mname) as fullname, CONCAT(barangay, ', ', municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
      name +
      "%') AND municipality LIKE '%" +
      mun +
      "%' AND barangay LIKE '%" +
      brgy +
      "%' ORDER BY municipality, barangay, v_lname, v_mname, v_fname LIMIT 3000";

    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let votersArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.id;
      const fullname = result.fullname;
      const address = result.address;
      const bday = result.v_birthday;
      const age = result.age;
      const record_type = result.record_type;
      const precinct = result.v_precinct_no;
      const v_idx = result.v_idx;

      const taggedSql =
        "SELECT  COUNT(*) AS cnt,(SELECT COUNT(*) FROM head_household WHERE fh_v_id = '" +
        v_id +
        "') AS cntt, (SELECT user_id FROM head_household  WHERE fh_v_id = '" +
        v_id +
        "' LIMIT 1) AS uid2, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) AS fhfullname,   user_id AS uid,    (SELECT  username  FROM userstbl  WHERE(user_id = uid OR user_id = uid2)) AS username, (SELECT COUNT(*) FROM leaders WHERE v_id = '" +
        v_id +
        "' and electionyear = 2025 and status is null) AS leadercnt FROM household_warding INNER JOIN v_info ON v_info.v_id = household_warding.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE(mem_v_id = '" +
        v_id +
        "' OR fh_v_id = '" +
        v_id +
        "')";
      const tagged = await new Promise((resolve, reject) => {
        db.query(taggedSql, (error, rRrms) => {
          if (error) {
            reject(error);
          } else {
            resolve(rRrms);
          }
        });
      });

      votersArr.push({
        v_id: v_id,
        fullname: fullname,
        address: address,
        bday: bday,
        record_type: record_type,
        tagged: tagged,
        age: age,
        precinct: precinct,
        v_idx: v_idx,
      });
    });

    await Promise.all(promises);
    // console.log(votersArr);
    res.send(votersArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/searchNoFb", async (req, res) => {
  try {
    var name = req.query.searchTxt.trim();
    if (name == "*") {
      name = "";
    }
    var brgy = req.query.brgy;
    var mun = req.query.mun;
    var limit = req.query.limit;
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  try {
    const sql =
      "SELECT v_info.v_id as id, CONCAT(v_lname, ' ', v_fname, ' ', v_mname) as fullname, CONCAT(barangay, ', ', municipality) as address, DATE_FORMAT(v_birthday, '%b. %d, %Y') as v_birthday, record_type, TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) AS age, v_precinct_no from v_info LEFT JOIN facebook ON facebook.v_id = v_info.v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
      name +
      "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
      name +
      "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
      name +
      "%') AND municipality LIKE '%" +
      mun +
      "%' AND barangay LIKE '%" +
      brgy +
      "%' AND facebook.id is null AND record_type <> '2' ORDER BY municipality, barangay, v_lname, v_mname, v_fname LIMIT " +
      limit;
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let votersArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.id;
      const fullname = result.fullname;
      const address = result.address;
      const bday = result.v_birthday;
      const age = result.age;
      const record_type = result.record_type;
      const precinct = result.v_precinct_no;

      const remarksSql =
        "SELECT * from v_remarks INNER JOIN quick_remarks on quick_remarks.remarks_id = v_remarks.remarks_id WHERE v_id = '" +
        v_id +
        "'";
      const remarks = await new Promise((resolve, reject) => {
        db.query(remarksSql, (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      const fbLinkSql = "SELECT * FROM facebook WHERE v_id = '" + v_id + "'";
      const fb = await new Promise((resolve, reject) => {
        db.query(fbLinkSql, (error, rFb) => {
          if (error) {
            reject(error);
          } else {
            resolve(rFb);
          }
        });
      });

      const contactSql =
        "SELECT contact_number from v_contact_numbers WHERE v_id = '" +
        v_id +
        "'";
      const contactNos = await new Promise((resolve, reject) => {
        db.query(contactSql, (error, rContacts) => {
          if (error) {
            reject(error);
          } else {
            resolve(rContacts);
          }
        });
      });

      const leadersSql =
        "SELECT type, electionyear from leaders WHERE v_id = '" +
        v_id +
        "' and status is null";
      const leadersData = await new Promise((resolve, reject) => {
        db.query(leadersSql, (error, rLeaders) => {
          if (error) {
            reject(error);
          } else {
            resolve(rLeaders);
          }
        });
      });

      const wardedSql =
        "SELECT leader_v_id as leaderid, (SELECT CONCAT(v_lname, ', ',  v_fname, ' ',v_mname) from v_info WHERE v_id = leaderid) as leader, electionyear from wardingtbl WHERE member_v_id = '" +
        v_id +
        "'";
      const wardedData = await new Promise((resolve, reject) => {
        db.query(wardedSql, (error, rWarded) => {
          if (error) {
            reject(error);
          } else {
            resolve(rWarded);
          }
        });
      });

      const remarksAddSql =
        "SELECT * from additional_remarks WHERE v_id = '" + v_id + "'";
      const remarksAdd = await new Promise((resolve, reject) => {
        db.query(remarksAddSql, (error, rRrms) => {
          if (error) {
            reject(error);
          } else {
            resolve(rRrms);
          }
        });
      });

      const imgSql =
        "SELECT imgname,type from v_imgtbl WHERE v_id = '" +
        v_id +
        "' ORDER BY ID desc LIMIT 1";
      const vImg = await new Promise((resolve, reject) => {
        db.query(imgSql, (error, rRrms) => {
          if (error) {
            reject(error);
          } else {
            resolve(rRrms);
          }
        });
      });

      // const numbersSql =
      //   "SELECT v_email from v_contact_info WHERE v_id = '" + v_id + "'";
      // const numbers = await new Promise((resolve, reject) => {
      //   db.query(numbersSql, (error, rNumbers) => {
      //     if (error) {
      //       reject(error);
      //     } else {
      //       resolve(rNumbers);
      //     }
      //   });
      // });

      votersArr.push({
        v_id: v_id,
        fullname: fullname,
        address: address,
        bday: bday,
        remarks: remarks,
        record_type: record_type,
        // supporter: supporter,
        age: age,
        fb: fb,
        contact: contactNos,
        precinct: precinct,
        leader: leadersData,
        warding: wardedData,
        remarks_add: remarksAdd,
        vImg: vImg,
      });
    });

    await Promise.all(promises);

    res.send(votersArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/userTags", (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(dateRecorded) between '" + datefrom + "' and '" + dateto + "'";

  try {
    const sql =
      "SELECT fname, COUNT(*) AS tags, recordedBy FROM v_remarks INNER JOIN userstbl ON userstbl.user_id = v_remarks.recordedBy WHERE " +
      query +
      " GROUP BY v_remarks.recordedBy ORDER BY tags DESC";

    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/status", (req, res, next) => res.sendStatus(200));

app.post("/saveProfilepic", (req, res) => {
  try {
    const uid = req.query.userid;
    const datestring = getCurrentDate();
    var datenow = datestring.date + " " + datestring.time;
    const fname = req.query.fname;
    const lname = req.query.lname;
    const password = req.query.password;

    try {
      uploadUser(req, res, async (err) => {
        if (err) {
          // Handle upload error
          console.error(err);
          return res.status(500).json({ error: "Failed to upload file" });
        }

        let query;

        // Check if a file was uploaded
        if (req.file) {
          // File was uploaded, include the filename in the update
          const filename = req.file.filename;
          query =
            "UPDATE userstbl SET fname = '" +
            fname +
            "', lname = '" +
            lname +
            "', imgname = '" +
            filename +
            "', password = '" +
            password +
            "' WHERE user_id = '" +
            uid +
            "'";
        } else {
          // No file was uploaded, update other fields only
          query =
            "UPDATE userstbl SET fname = '" +
            fname +
            "', lname = '" +
            lname +
            "', password = '" +
            password +
            "' WHERE user_id = '" +
            uid +
            "'";
        }

        console.log(query);
        await db.query(query, function (err, result) {
          if (err) throw err;
          console.log(result);
          res.status(200).json({ message: "Profile updated successfully" });
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {}
});

app.get("/getUserData", (req, res) => {
  const userid = req.query.uid;
  try {
    const sql = "SELECT * from userstbl WHERE user_id = " + userid + "";

    db.query(sql, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/getVoters", async (req, res) => {
  const mun = req.query.municipality;
  const brgy = req.query.barangay;

  // Check if municipality and barangay are provided
  if (!mun || !brgy) {
    return res
      .status(400)
      .json({ message: "Municipality and Barangay are required." });
  }

  try {
    // Use parameterized query to prevent SQL injection
    const sql = `
   SELECT * 
      FROM v_info 
      INNER JOIN barangays ON barangays.id = v_info.barangayId 
      WHERE municipality = ? AND barangay = ? ORDER BY v_lname, v_fname LIMIT 3000
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(sql, [mun, brgy], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    // Array to hold household and warded data
    let houseHoldArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.v_id;
      const fname = result.v_fname;
      const mname = result.v_mname;
      const lname = result.v_lname;
      const recordtype = result.record_type;
      const bday = result.v_birthday;

      // Query to check household
      const houseHoldChecksql = `
        SELECT COUNT(*) AS householdCount, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) AS head_household
        FROM household_warding
        INNER JOIN v_info ON v_info.v_id = household_warding.fh_v_id
        WHERE mem_v_id = ?
      `;

      const household = await new Promise((resolve, reject) => {
        db.query(houseHoldChecksql, [v_id], (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      // Query to check warded data
      const wardedSql = `
        SELECT COUNT(*) AS wardedCount, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) AS leader
        FROM wardingtbl
        INNER JOIN v_info ON v_info.v_id = wardingtbl.leader_v_id
        WHERE member_v_id = ? AND electionyear = '2025'
      `;

      const warded = await new Promise((resolve, reject) => {
        db.query(wardedSql, [v_id], (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      // Query to check leader data
      const leaderSql = `SELECT type from leaders WHERE electionyear = '2025' AND leaders.v_id = ? and laynes is null`;

      const leader = await new Promise((resolve, reject) => {
        db.query(leaderSql, [v_id], (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      // Push result into the houseHoldArr
      houseHoldArr.push({
        v_id: v_id,
        fname: fname,
        mname: mname,
        lname: lname,
        bday: bday,
        record_type: recordtype,
        warded: warded.length > 0 ? warded[0] : null, // Check if warded data exists
        leader: leader.length > 0 ? leader[0] : null, // Check if leader data exists
        withhousehold: household.length > 0 ? household[0] : null, // Check if household data exists
      });
    });

    // Wait for all async operations to finish
    await Promise.all(promises);

    // Send the data as the response
    console.log(houseHoldArr);
    res.json(houseHoldArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getVotersCount", (req, res) => {
  const mun = req.query.mun;
  const brgy = req.query.mun;
  var query = "";
  if (mun) {
    query =
      "SELECT count(*) as cnt, municipality, barangay from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE municipality = '" +
      mun +
      "' AND record_type <> '2' GROUP BY barangay";
  } else {
    query =
      "SELECT count(*)as cnt, municipality from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE record_type <> '2' GROUP BY municipality";
  }

  try {
    db.query(query, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getAgeGroup", (req, res) => {
  const mun = req.query.mun;
  const brgy = req.query.mun;
  var query = "";
  if (mun) {
    query =
      "select COUNT(*) as cnt,municipality from v_info INNER JOIN barangays ON barangays.id = v_info.v_id WHERE TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) between 18 AND 32 AND record_type <> '2'  GROUP BY municipality";
  } else {
    query =
      "select COUNT(*) as cnt,municipality from v_info INNER JOIN barangays ON barangays.id = v_info.v_id WHERE TIMESTAMPDIFF(YEAR, v_birthday, CURDATE()) between 18 AND 32 AND record_type <> '2' GROUP BY municipality";
  }

  try {
    db.query(query, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getAgeGroups", (req, res) => {
  const query =
    "SELECT COUNT(*) as '18-32',(SELECT COUNT(*) FROM v_info WHERE TIMESTAMPDIFF(YEAR,v_birthday, CURDATE()) BETWEEN 33 AND 59 AND record_type <> '2') AS '33-59', (SELECT COUNT(*) FROM v_info WHERE TIMESTAMPDIFF(YEAR, v_birthday,CURDATE()) BETWEEN 60 AND 180 AND record_type <> '2') AS '60UP', (SELECT COUNT(*) FROM v_info WHERE TIMESTAMPDIFF(YEAR,v_birthday, CURDATE()) BETWEEN 0 AND 17 AND record_type <> '2') AS 'NOBDAY' FROM  v_info WHERE TIMESTAMPDIFF(YEAR,v_birthday, CURDATE()) BETWEEN 18 AND 32 AND record_type <> '2'";
  try {
    db.query(query, (error, result) => {
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/fbs", (req, res) => {
  const datestring = getCurrentDate();

  try {
    const sql =
      "SELECT COUNT(*) AS withfb, (SELECT COUNT(*) from facebook WHERE nofb = 1) AS nofb, (SELECT COUNT(*) from facebook WHERE inactive = 1) AS inactive, (SELECT COUNT(*) from facebook WHERE locked = 1) AS locked FROM facebook WHERE nofb = 0 AND inactive = 0 AND locked = 0";
    db.query(sql, (error, result) => {
      // console.log(datefrom);
      // console.log(dateto);
      // console.log(result);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getBarangay", (req, res) => {
  const municipality = req.query.municipality;
  try {
    if (municipality !== "") {
      const sql =
        "SELECT barangay from barangays WHERE municipality LIKE '%" +
        municipality +
        "%' GROUP BY barangay";
      db.query(sql, (error, result) => {
        // console.log(municipality + result);
        res.send(result);
      });
    }
  } catch (error) {
    console.error("Error fetching in gettags:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/saveBirthday", (req, res) => {
  const vid = req.query.vid;
  const birthday = req.query.birthday;
  try {
    const query = `UPDATE v_info SET v_birthday = '${birthday}' WHERE v_id = '${vid}'`;
    console.log(query);
    db.query(query, function (err, result) {
      if (err) throw err;
      //console.log("File name saved in database:", filename);
      console.log(result);

      res.status(200).json({ message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/deletepic", (req, res) => {
  const voterid = req.query.vid;
  const imgname = req.query.imgname;

  const query =
    "DELETE from v_imgtbl WHERE v_id = '" +
    voterid +
    "' AND imgname = '" +
    imgname +
    "'";

  db.query(query, function (err, result) {
    if (err) throw err;
    //console.log("File name saved in database:", filename);
    // console.log(result);
    // console.log(query);
    res.send(result);
  });
  // const filePath = path.join(__dirname, 'public', 'profiles', voterId, imgname);

  // fs.unlink(filePath, (err) => {
  //   if (err) {
  //     console.error('Error deleting file:', err);
  //     return res.status(500).json({ success: false, message: 'File deletion failed.' });
  //   }

  //   res.json({ success: true, message: 'File deleted successfully.' });
  // });
});

app.post("/deleteLeader", (req, res) => {
  const voterid = req.query.vid;

  const query = "UPDATE leaders SET status = 1 WHERE id = '" + voterid + "'";

  db.query(query, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/getHouseholds", async (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;
  const userid = req.query.uid;
  const municipality = req.query.mun;
  const barangay = req.query.brgy;

  try {
    const sql =
      "SELECT fh_v_id, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, leader_v_id, purok_st, (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id WHERE category_id = '55' and v_id = fh_v_id ORDER BY v_remarks_id DESC LIMIT 1) as cong, (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id WHERE category_id = '56' and v_id = fh_v_id ORDER BY v_remarks_id DESC LIMIT 1) as gov from head_household INNER JOIN v_info ON v_info.v_id = head_household.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE user_id = '" +
      userid +
      "' AND municipality = '" +
      municipality +
      "' AND barangay = '" +
      barangay +
      "' ORDER BY head_household.id DESC";
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let houseHoldArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.fh_v_id;
      const fhfullname = result.fullname;
      const leaderid = result.leader_v_id;
      const purok_st = result.purok_st;

      const leaderSql =
        "SELECT v_info.v_id as vid, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname from leaders INNER JOIN v_info ON v_info.v_id = leaders.v_id WHERE leaders.v_id = '" +
        leaderid +
        "'";
      const leader = await new Promise((resolve, reject) => {
        db.query(leaderSql, (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      const memberSql =
        "SELECT v_info.v_id, v_info.v_id as vid, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, municipality, barangay, mem_v_id, (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id WHERE category_id = '55' and v_id = vid ORDER BY v_remarks_id DESC LIMIT 1) as cong, (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id WHERE category_id = '56' and v_id = vid ORDER BY v_remarks_id DESC LIMIT 1) as gov, (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id WHERE category_id = '57' and v_id = vid ORDER BY v_remarks_id DESC LIMIT 1) as vgov from household_warding INNER JOIN v_info ON v_info.v_id = mem_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE fh_v_id = '" +
        v_id +
        "' ORDER BY household_warding.id ASC";
      const members = await new Promise((resolve, reject) => {
        db.query(memberSql, (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      houseHoldArr.push({
        fh: fhfullname,
        fhid: v_id,
        leaderid: leaderid,
        leader: leader,
        members: members,
        purok_st: purok_st,
      });
    });

    await Promise.all(promises);

    res.send(houseHoldArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/totalwarding", async (req, res) => {
  const datestring = getCurrentDate();
  var datefrom = datestring.date;
  var dateto = datestring.date;

  if (req.query.from && req.query.to) {
    datefrom = req.query.from;
    dateto = req.query.to;
  }

  query = "DATE(date_saved) between '" + datefrom + "' and '" + dateto + "'";

  try {
    const sql =
      "SELECT municipality AS mun, barangay AS brgy, COUNT(*) AS cnt,(SELECT COUNT(*) FROM household_warding INNER JOIN v_info ON v_info.v_id = household_warding.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE " +
      query +
      " AND municipality = mun AND barangay = brgy) AS total_members FROM head_household INNER JOIN v_info ON v_info.v_id = head_household.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE " +
      query +
      " GROUP BY municipality , barangay";
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          res.send(results);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/saveHouseHold", async (req, res) => {
  const { userid } = req.query; // Retrieve query parameter if needed
  const { familyHead, familyMember, purok, leader } = req.body; // Access data from request body

  const datestring = getCurrentDate();
  var datenow = datestring.date + " " + datestring.time;
  console.log(leader);
  // Example logic to handle the data (save to database, etc.)
  try {
    const query =
      "INSERT INTO head_household (fh_v_id, date_saved, user_id, purok_st, leader_v_id) VALUES ('" +
      familyHead.v_id +
      "','" +
      datenow +
      "','" +
      userid +
      "','" +
      purok +
      "','" +
      leader.v_id +
      "')";
    db.query(query, function (err, result) {
      if (err) throw err;
      console.log(result);
    });

    if (familyMember) {
      for (const member of familyMember) {
        const query =
          "INSERT INTO household_warding (fh_v_id, mem_v_id, date_saved, user_id) VALUES ('" +
          familyHead.v_id +
          "','" +
          member.v_id +
          "','" +
          datenow +
          "','" +
          userid +
          "')";
        db.query(query, function (err, result) {
          if (err) throw err;
          console.log(result);
        });
      }
    }

    res.status(200).json({ message: "Household data received successfully" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/addLeaderWarding", async (req, res) => {
  const { leader_id, members, municipality, barangay, userId } = req.body;

  if (!leader_id || !members || members.length === 0) {
    return res.status(400).json({ error: "Invalid request data." });
  }

  // Define the current date (for daterecorded)
  const currentDate = new Date().toISOString().slice(0, 10);

  // Define the election year (optional, could be dynamic or passed in the request)
  const electionYear = new Date().getFullYear().toString();

  // Create an array of values to be inserted
  const values = members.map((member_id) => [
    leader_id,
    member_id,
    "Leader Warding", // Example warding type
    electionYear,
    currentDate,
    userId,
  ]);

  // SQL query
  const sql =
    "INSERT INTO wardingtbl (leader_v_id, member_v_id, warding_type, electionyear, daterecorded, userid) VALUES ?";

  try {
    // Execute the query using MySQL connection
    await db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Error inserting warding data:", err);
        return res.status(500).json({ error: "Failed to save data." });
      }
      return res.status(200).json({
        message: "Warding data saved successfully.",
        insertedRows: result.affectedRows,
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Unexpected error occurred." });
  }
});

app.post("/updatePurok", async (req, res) => {
  const { userid } = req.query; // Retrieve query parameter if needed
  const { selectedHousehold, purok } = req.body; // Destructure data from request body

  const datestring = getCurrentDate();
  const datenow = `${datestring.date} ${datestring.time}`;

  try {
    if (!selectedHousehold || !selectedHousehold.fhid) {
      return res
        .status(400)
        .json({ error: "Family head ID (fhid) is required" });
    }

    if (!purok) {
      return res.status(400).json({ error: "Purok value is required" });
    }

    // Update query to modify the purok_st based on fhid
    const query = `UPDATE head_household SET purok_st = ?, user_id = ? WHERE fh_v_id = ? `;
    db.query(query, [purok, userid, selectedHousehold.fhid], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to update record" });
      }

      console.log("Update result:", result);
      return res.status(200).json({ message: "Record updated successfully" });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/updateHouseholdHead", async (req, res) => {
  const { userid } = req.query; // Retrieve query parameter if needed
  const { currentFhid, newFhid } = req.query; // Destructure data from request body

  const datestring = getCurrentDate();
  const datenow = `${datestring.date} ${datestring.time}`;

  try {
    // Update query to modify the purok_st based on fhid
    const query = `UPDATE head_household SET fh_v_id = ? WHERE fh_v_id = ? `;
    db.query(query, [newFhid, currentFhid], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to update record" });
      }

      const query3 = `UPDATE household_warding SET fh_v_id = ? WHERE fh_v_id = ?`;
      db.query(query3, [newFhid, currentFhid], (err, result3) => {
        if (err) {
          console.error("Database error (members update):", err);
          return res
            .status(500)
            .json({ error: "Failed to update household members" });
        }
      });
    });
    return res.status(200).json({ message: "Record updated successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/saveLeader", async (req, res) => {
  // const { vid, userId } = req.body; // Access data from request body
  const { vid, userId, leaderType } = req.body; // Now, also receive the 'type'

  const datestring = getCurrentDate();
  const datenow = datestring.date + " " + datestring.time;

  try {
    // Check if the v_id exists
    const checkQuery =
      "SELECT id FROM leaders WHERE v_id = ? AND type = ? and electionyear = '2025' and laynes is null";
    db.query(checkQuery, [vid, leaderType], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking v_id:", checkErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (checkResult.length === 0) {
        // v_id does not exist, insert a new record
        const insertQuery = `
          INSERT INTO leaders (v_id, type, electionyear, dateadded, user_id) 
          VALUES (?, ?, '2025', ?, ?)
        `;
        db.query(
          insertQuery,
          [vid, leaderType, datenow, userId],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting leader:", insertErr);
              return res.status(500).json({ message: "Error saving leader" });
            }
            console.log("Leader inserted:", insertResult);
            res.status(200).json({ message: "Leader Saved" });
          }
        );
      } else {
        // v_id exists, update status to NULL
        var id = checkResult[0].id;

        const updateQuery =
          "UPDATE leaders SET status = NULL, user_id = ? WHERE id = ? and laynes is null";
        db.query(updateQuery, [userId, id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating leader status:", updateErr);
            return res
              .status(500)
              .json({ message: "Error updating leader status" });
          }
          console.log("Leader status updated:", updateResult);
          res.status(200).json({ message: "Leader status updated to NULL" });
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
});

app.post("/addMember", async (req, res) => {
  const fhid = req.query.fhid;
  const member = req.query.memid;
  const user_id = req.query.uid;
  const datestring = getCurrentDate();
  var datenow = datestring.date + " " + datestring.time;

  // Example logic to handle the data (save to database, etc.)
  try {
    const query = `INSERT INTO household_warding (fh_v_id, mem_v_id, date_saved,user_id) VALUES ('${fhid}', '${member}', '${datenow}', '${user_id}')`;
    db.query(query, function (err, result) {
      if (err) throw err;
      console.log(result);
    });
    res.status(200).json({ message: "Member added." });
  } catch (error) {
    console.log(error);
  }
});

app.post("/deleteHousehold", async (req, res) => {
  const fhid = req.query.fhid;

  if (!fhid) {
    return res.status(400).send({ error: "Missing required parameter 'fhid'" });
  }

  try {
    // Using parameterized queries to prevent SQL injection
    const query = "DELETE FROM head_household WHERE fh_v_id = ?";
    const query1 = "DELETE FROM household_warding WHERE fh_v_id = ?";

    db.query(query, [fhid], (err, result) => {
      if (err) {
        console.error("Error deleting from head_household:", err);
        return res
          .status(500)
          .send({ error: "Failed to delete from head_household" });
      }

      db.query(query1, [fhid], (err, result) => {
        if (err) {
          console.error("Error deleting from household_warding:", err);
          return res
            .status(500)
            .send({ error: "Failed to delete from household_warding" });
        }

        res.send({ success: true, message: "Deletion successful", result });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send({ error: "An unexpected error occurred" });
  }
});

app.post("/deleteHouseholdMember", async (req, res) => {
  const fhid = req.query.fhid;
  const memid = req.query.memid;

  const query =
    "DELETE from household_warding WHERE fh_v_id = '" +
    fhid +
    "' AND mem_v_id = '" +
    memid +
    "'";

  db.query(query, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/searchMember", (req, res) => {
  const text = req.query.text;
  const mun = req.query.mun;
  const brgy = req.query.brgy;

  // console.log(mun);
  // console.log(brgy);
  try {
    if (text !== "") {
      const sql =
        "SELECT CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, municipality, barangay, v_id, (SELECT COUNT(*) from household_warding WHERE (fh_v_id = v_id OR mem_v_id = v_id)) as cnt, (SELECT COUNT(*) from head_household WHERE fh_v_id = v_id) as cnt2 from v_info INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
        text +
        "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
        text +
        "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
        text +
        "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
        text +
        "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
        text +
        "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
        text +
        "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
        text +
        "%') AND municipality = '" +
        mun +
        "' AND barangay = '" +
        brgy +
        "' AND record_type = 1 ORDER BY municipality, barangay, v_lname LIMIT 50";
      db.query(sql, (error, result) => {
        res.send(result);
      });
    }
  } catch (error) {
    console.error("Error fetching in gettags:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  // console.log(text);
});

app.get("/searchLeader", (req, res) => {
  const text = req.query.text;
  const mun = req.query.mun;
  const brgy = req.query.brgy;

  let brgyquery = "";
  if (brgy && brgy !== "") {
    brgyquery = ` AND barangay = '${brgy}' `;
  }

  let munquery = "";
  if (mun && mun !== "") {
    munquery = ` AND municipality = '${mun}' `;
  }

  // console.log(mun);
  // console.log(brgy);
  try {
    if (text !== "") {
      const sql =
        "SELECT CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, municipality as v_municipality, barangay as v_barangay, v_info.v_id from v_info INNER JOIN leaders ON leaders.v_id = v_info.v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE  (CONCAT(v_info.v_lname,' ',v_info.v_fname,' ',v_info.v_mname) like '%" +
        text +
        "%' OR CONCAT(v_fname, ' ', v_lname) like '%" +
        text +
        "%' OR CONCAT(v_fname, ' ', v_mname) like '%" +
        text +
        "%' OR CONCAT(v_mname, ' ', v_lname) like '%" +
        text +
        "%' OR CONCAT(v_lname, ' ', v_mname) like '%" +
        text +
        "%' OR CONCAT(v_lname, ' ', v_fname) like '%" +
        text +
        "%' OR CONCAT(v_mname, ' ', v_fname) like '%" +
        text +
        "%')" +
        munquery +
        " " +
        brgyquery +
        " AND record_type = 1 AND electionyear = '2025' and leaders.status is null GROUP BY leaders.v_id ORDER BY municipality, barangay, v_lname LIMIT 100";
      db.query(sql, (error, result) => {
        console.log(sql);
        res.send(result);
      });
    }
  } catch (error) {
    console.error("Error fetching in gettags:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  // console.log(text);
});

app.get("/rename-folders", (req, res) => {
  const baseFolder = path.join(__dirname, "./public/uploads/");
  // Query the database
  db.query(
    "SELECT v_idx, v_imgtbl.v_id as vid FROM v_info INNER JOIN v_imgtbl ON v_imgtbl.v_id = v_info.v_id WHERE v_info.v_id = '124255'",
    (err, results) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res.status(500).json({ error: "Failed to fetch data" });
      }

      // Loop through the results and rename folders
      results.forEach((row) => {
        const oldFolderPath = path.join(baseFolder, row.v_idx);
        const newFolderPath = path.join(baseFolder, row.vid);

        // Rename the folder
        fs.rename(oldFolderPath, newFolderPath, (err) => {
          if (err) {
            console.error(
              `Error renaming folder ${row.v_idx} to ${row.vid}:`,
              err
            );
          } else {
            console.log(`Successfully renamed ${row.v_idx} to ${row.vid}`);
          }
        });
      });
      res.json({
        message: "Folder renaming process initiated. Check logs for details.",
      });
    }
  );
});

app.get("/getPuroks", (req, res) => {
  const mun = req.query.municipality;
  const brgy = req.query.barangay;

  try {
    if (brgy !== "") {
      const sql =
        "SELECT purok_st from head_household INNER JOIN v_info ON v_info.v_id = head_household.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE municipality = '" +
        mun +
        "' AND barangay = '" +
        brgy +
        "' GROUP BY purok_st";
      db.query(sql, (error, result) => {
        // console.log(municipality + result);
        res.send(result);
      });
    }
  } catch (error) {
    console.error("Error fetching in gettags:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/gethouseholdwardingreport", async (req, res) => {
  const municipality = req.query.mun;
  const barangay = req.query.brgy;
  const purok = req.query.purok;
  var purokquery = "";
  var brgyquery = "";

  if (purok !== "") {
    purokquery = ` AND purok_st ='${purok}' `;
  }

  if (barangay !== "") {
    brgyquery = ` AND barangay LIKE '%${barangay}%' `;
  }

  try {
    const sql =
      "SELECT fh_v_id, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, purok_st, barangay, municipality from head_household INNER JOIN v_info ON v_info.v_id = head_household.fh_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE municipality = '" +
      municipality +
      "' " +
      brgyquery +
      purokquery +
      " GROUP BY fh_v_id ORDER BY barangay, purok_st, CONCAT(v_lname, ', ', v_fname, ' ', v_mname) ASC";
    const results = await new Promise((resolve, reject) => {
      db.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let houseHoldArr = [];

    const promises = results.map(async (result) => {
      const v_id = result.fh_v_id;
      const fhfullname = result.fullname;
      const mun = result.municipality;
      const brgy = result.barangay;
      const purok_st = result.purok_st;

      const memberSql =
        "SELECT CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, municipality, barangay from household_warding INNER JOIN v_info ON v_info.v_id = household_warding.mem_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE fh_v_id = '" +
        v_id +
        "'";
      const members = await new Promise((resolve, reject) => {
        db.query(memberSql, (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      const leaderSql =
        "SELECT CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, municipality, barangay from head_household INNER JOIN v_info ON v_info.v_id = head_household.leader_v_id INNER JOIN barangays ON barangays.id = v_info.barangayId WHERE head_household.fh_v_id = '" +
        v_id +
        "'";
      const leader = await new Promise((resolve, reject) => {
        db.query(leaderSql, (error, r) => {
          if (error) {
            reject(error);
          } else {
            resolve(r);
          }
        });
      });

      houseHoldArr.push({
        fh: fhfullname,
        fhid: v_id,
        members: members,
        mun: mun,
        brgy: brgy,
        purok_st: purok_st,
        leader: leader,
      });
    });

    await Promise.all(promises);

    res.send(houseHoldArr);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all leaders
app.get("/leaders", async (req, res) => {
  try {
    const query = "SELECT * FROM wardingtbl WHERE leader_v_id IS NOT NULL";
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leaders." });
  }
});

// Add a new leader
app.post("/leaders", async (req, res) => {
  const { leader_v_id, warding_type, electionyear, userid } = req.body;
  try {
    const query =
      "INSERT INTO wardingtbl (leader_v_id, warding_type, electionyear, daterecorded, userid) VALUES (?, ?, ?, NOW(), ?)";
    await db.execute(query, [leader_v_id, warding_type, electionyear, userid]);
    res.status(201).json({ message: "Leader added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add leader." });
  }
});

// Update a leader
app.put("/leaders/:id", async (req, res) => {
  const { id } = req.params;
  const { leader_v_id, warding_type, electionyear, userid } = req.body;
  try {
    const query =
      "UPDATE wardingtbl SET leader_v_id = ?, warding_type = ?, electionyear = ?, userid = ? WHERE warding_id = ?";
    await db.execute(query, [
      leader_v_id,
      warding_type,
      electionyear,
      userid,
      id,
    ]);
    res.json({ message: "Leader updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update leader." });
  }
});

// Delete a leader
app.delete("/leaders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM wardingtbl WHERE warding_id = ?";
    await db.execute(query, [id]);
    res.json({ message: "Leader deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete leader." });
  }
});

app.post("/saveLeaderLaynes", async (req, res) => {
  // const { vid, userId } = req.body; // Access data from request body
  const { vid, userId, leaderType } = req.body; // Now, also receive the 'type'

  const datestring = getCurrentDate();
  const datenow = datestring.date + " " + datestring.time;

  try {
    // Check if the v_id exists
    const checkQuery =
      "SELECT id FROM leaders WHERE v_id = ? AND type = ? and electionyear = '2025' and laynes is not null";
    db.query(checkQuery, [vid, leaderType], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking v_id:", checkErr);
        return res.status(500).json({ message: "Database error" });
      }

      if (checkResult.length === 0) {
        // v_id does not exist, insert a new record
        const insertQuery = `
          INSERT INTO leaders (v_id, type, electionyear, dateadded, user_id, laynes) 
          VALUES (?, ?, '2025', ?, ?, 1)
        `;
        db.query(
          insertQuery,
          [vid, leaderType, datenow, userId],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting leader:", insertErr);
              return res.status(500).json({ message: "Error saving leader" });
            }
            console.log("Leader inserted:", insertResult);
            res.status(200).json({ message: "Leader Saved" });
          }
        );
      } else {
        // v_id exists, update status to NULL
        var id = checkResult[0].id;

        const updateQuery =
          "UPDATE leaders SET status = NULL, user_id = ? WHERE id = ?";
        db.query(updateQuery, [userId, id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating leader status:", updateErr);
            return res
              .status(500)
              .json({ message: "Error updating leader status" });
          }
          console.log("Leader status updated:", updateResult);
          res.status(200).json({ message: "Leader status updated to NULL" });
        });
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
});

app.post("/migrateData", (req, res) => {
  const { sourceVid, targetVid } = req.body;

  // Helper function for promise-based queries
  function query(connection, sql, params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Validate input
  if (!sourceVid || !targetVid || sourceVid === targetVid) {
    return res.status(400).json({ message: "Invalid voterear IDs" });
  }

  // Start transaction
  db.getConnection((err, connection) => {
    if (err)
      return res.status(500).json({ message: "Database connection error" });

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ message: "Transaction start failed" });
        console.log("error");
      }

      try {
        // 1. First get all data from source voter
        const [sourceData] = await query(
          connection,
          `SELECT * FROM v_info WHERE v_id = ?`,
          [sourceVid]
        );

        if (!sourceData) {
          throw new Error("Source voter not found");
        }

        // 2. Update target voter with source data
        await query(
          connection,
          `UPDATE v_info SET 
              v_fname = ?,
              v_mname = ?,
              v_lname = ?,
              v_birthday = ?,
              v_gender = ?
             WHERE v_id = ?`,
          [
            sourceData.v_fname,
            sourceData.v_mname,
            sourceData.v_lname,
            sourceData.v_birthday,
            sourceData.v_gender,
            targetVid,
          ]
        );

        // Migrate Remarks (Tags)
        await query(
          connection,
          `UPDATE v_remarks SET v_id = ? WHERE v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate Facebook Data
        await query(connection, `UPDATE facebook SET v_id = ? WHERE v_id = ?`, [
          targetVid,
          sourceVid,
        ]);

        // Migrate head of household
        await query(
          connection,
          `UPDATE head_household SET fh_v_id = ? WHERE fh_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate household warding fh
        await query(
          connection,
          `UPDATE household_warding SET fh_v_id = ? WHERE fh_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate household warding member
        await query(
          connection,
          `UPDATE household_warding SET mem_v_id = ? WHERE mem_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate SO leader
        await query(
          connection,
          `UPDATE sotbl SET leader_v_id = ? WHERE leader_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate SO member
        await query(
          connection,
          `UPDATE sotbl SET member_v_id = ? WHERE member_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate contact numbers
        await query(
          connection,
          `UPDATE v_contact_numbers SET v_id = ? WHERE v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate uploads
        await query(connection, `UPDATE v_imgtbl SET v_id = ? WHERE v_id = ?`, [
          targetVid,
          sourceVid,
        ]);

        // Migrate warding leader
        await query(
          connection,
          `UPDATE wardingtbl SET leader_v_id = ? WHERE leader_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate warding leader
        await query(
          connection,
          `UPDATE wardingtbl SET member_v_id = ? WHERE member_v_id = ?`,
          [targetVid, sourceVid]
        );

        // Migrate warding leader
        await query(connection, `UPDATE leaders SET v_id = ? WHERE v_id = ?`, [
          targetVid,
          sourceVid,
        ]);

        const baseFolder = path.join(__dirname, "./public/uploads/");

        const oldFolderPath = path.join(baseFolder, sourceVid.toString());
        const newFolderPath = path.join(baseFolder, targetVid.toString());

        fs.rename(oldFolderPath, newFolderPath, (err) => {
          if (err) {
            console.error(
              `Error renaming folder ${targetVid} to ${sourceVid}:`,
              err
            );
          } else {
            console.log(`Successfully renamed ${targetVid} to ${sourceVid}`);
          }
        });

        const baseFolder2 = path.join(__dirname, "./public/profiles/");

        const oldFolderPath2 = path.join(baseFolder2, sourceVid.toString());
        const newFolderPath2 = path.join(baseFolder2, targetVid.toString());

        fs.rename(oldFolderPath2, newFolderPath2, (err) => {
          if (err) {
            console.error(
              `Error renaming folder ${targetVid} to ${sourceVid}:`,
              err
            );
          } else {
            console.log(`Successfully renamed ${targetVid} to ${sourceVid}`);
          }
        });

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              throw err;
            });
          }
          connection.release();
          res.status(200).json({ message: "Migration completed successfully" });
        });
      } catch (error) {
        connection.rollback(() => {
          connection.release();
          console.error("Migration error:", error);
          res
            .status(500)
            .json({ message: "Migration failed", error: error.message });
        });
      }
    });
  });
});

app.get("/getLeadersRegistration", (req, res) => {
  var mun = req.query.municipality;
  var brgy = req.query.barangay;

  const datestring = getCurrentDate();
  const datenow = `${datestring.date}`;

  let brgyquery = "";
  if (brgy && brgy !== "") {
    brgyquery = ` AND barangay = '${brgy}' `;
  }

  try {
    // Updated query to include leader's profile photo
    const sql = `
      SELECT 
        barangay, 
        municipality, 
        v_fname, 
        v_mname, 
        v_lname, 
        type, 
        record_type, 
        v_info.v_id,
        -- Get the latest profile image for the leader
        (SELECT imgname FROM v_imgtbl WHERE v_id = v_info.v_id AND (type IS NULL OR type = 1) ORDER BY id DESC LIMIT 1) AS profile_photo,
         -- Get the latest profile image for the leader
        (SELECT COUNT(*) FROM v_imgtbl WHERE v_id = v_info.v_id AND type = 3 ORDER BY id DESC LIMIT 1) AS signature,
          -- Get the latest profile image for the leader
        (SELECT attendance_status FROM leader_registrations WHERE leader_id = v_info.v_id AND date_registered LIKE '%${datenow}%' LIMIT 1) AS attendance_status,
        laynes
      FROM 
        v_list.leaders 
      INNER JOIN 
        v_info ON v_info.v_id = leaders.v_id 
      INNER JOIN 
        barangays ON barangays.id = v_info.barangayId 
      WHERE 
        municipality = '${mun}' 
        ${brgyquery}
        AND status IS NULL 
        AND electionyear = 2025
        GROUP BY leaders.v_id
      ORDER BY 
        type DESC, v_lname, v_mname ASC`;

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      // Modify result to include the full path for the profile image
      const updatedResult = result.map((leader) => {
        // Assuming photos are stored in '/profiles/{leaderId}/{imgName}'
        const photoPath = leader.profile_photo
          ? `${leader.v_id}/${leader.profile_photo}`
          : `userprofiles/k.jpg`; // Default photo if no profile photo exists
        return { ...leader, photo: photoPath }; // Add photo path to each leader
      });
      console.log(updatedResult);
      res.send(updatedResult); // Send the updated leaders list with photo paths
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getIncRegistration", (req, res) => {
  var mun = req.query.municipality;
  var brgy = req.query.barangay;

  const datestring = getCurrentDate();
  const datenow = `${datestring.date}`;

  let brgyquery = "";
  if (brgy && brgy !== "") {
    brgyquery = ` AND barangay = '${brgy}' `;
  }

  try {
    // Updated query to include leader's profile photo
    const sql = `
      SELECT 
    barangay, 
    municipality, 
    v_fname, 
    v_mname, 
    v_lname, 
    record_type, 
    v_info.v_id as vid,
    v_info.v_id,
    -- Combining remarks_id and remarks_txt into one string
    (SELECT v_remarks.remarks_id
     FROM v_remarks 
     INNER JOIN quick_remarks 
       ON v_remarks.remarks_id = quick_remarks.remarks_id 
     WHERE category_id = 199 AND v_remarks.v_id = vid
     LIMIT 1) as type,
    -- Get the latest profile image for the leader
    (SELECT imgname 
     FROM v_imgtbl 
     WHERE v_id = v_info.v_id 
       AND (v_imgtbl.type IS NULL OR v_imgtbl.type = 1) 
     ORDER BY id DESC 
     LIMIT 1) AS profile_photo,
    -- Count of images with type = 3
    (SELECT COUNT(*) 
     FROM v_imgtbl 
     WHERE v_id = vid 
       AND v_imgtbl.type = 3) AS signature,
    -- Attendance status
    (SELECT attendance_status 
     FROM leader_registrations 
     WHERE leader_id = v_info.v_id 
       AND date_registered LIKE '%${datenow}%' 
     LIMIT 1) AS attendance_status
FROM 
    v_info
INNER JOIN 
    barangays 
    ON barangays.id = v_info.barangayId 
WHERE 
    municipality = '${mun}' 
    ${brgyquery}
  AND record_type = 1
ORDER BY 
    barangayId, v_lname, v_mname ASC;
`;

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      // Modify result to include the full path for the profile image
      const updatedResult = result.map((leader) => {
        // Assuming photos are stored in '/profiles/{leaderId}/{imgName}'
        const photoPath = leader.profile_photo
          ? `${leader.v_id}/${leader.profile_photo}`
          : `userprofiles/k.jpg`; // Default photo if no profile photo exists
        return { ...leader, photo: photoPath }; // Add photo path to each leader
      });
      console.log(updatedResult);
      res.send(updatedResult); // Send the updated leaders list with photo paths
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/uploadPhoto", (req, res) => {
  const id = req.query.id;
  const uid = req.query.userid;

  const datestring = getCurrentDate();
  const datenow = `${datestring.date} ${datestring.time}`;

  upload(req, res, async (err) => {
    if (err) {
      // Handle file upload error
      console.error(err);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get the uploaded file's name
    const filename = req.file.filename;

    // Insert file name and other details into the database
    const query = `
      INSERT INTO v_imgtbl (v_id, imgname, type, daterecorded, user_id) 
      VALUES ('${id}', '${filename}', 1, '${datenow}', ${uid})
    `;

    try {
      await db.query(query);
      console.log("File name saved in database:", filename);
      res.status(200).json({
        message: "File uploaded successfully",
        fileName: filename, // Send the filename in the response
      });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ error: "Failed to save file details in database" });
    }
  });
});

app.post("/uploadSignature", (req, res) => {
  const id = req.query.id;
  const uid = req.query.userid;

  const datestring = getCurrentDate();
  const datenow = `${datestring.date} ${datestring.time}`;

  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filename = req.file.filename;

    const query = `
    INSERT INTO v_imgtbl (v_id, imgname, type, daterecorded, user_id) 
    VALUES ('${id}', '${filename}', 3, '${datenow}', ${uid})
  `;

    try {
      await db.query(query);
      console.log(query);
      res.status(200).json({
        message: "Signature uploaded successfully",
        fileName: filename,
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save signature in database" });
    }
  });
});

app.post("/markAttendance", async (req, res) => {
  const { leader_id, userid, attendance_status } = req.body;

  try {
    const query = `
      INSERT INTO leader_registrations (leader_id, userid, attendance_status)
      VALUES (?, ?, ?)`;

    const result = await db.query(query, [
      leader_id,
      userid,
      attendance_status,
    ]);

    if (result) {
      res.status(200).json({ message: "Attendance marked successfully." });
    } else {
      res.status(400).json({ message: "Failed to mark attendance." });
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/updateHouseholdLeader", async (req, res) => {
  // If you expect the data in the request body, use req.body
  const { fhid, leaderid } = req.query;

  try {
    const query = `UPDATE head_household SET leader_v_id = ? WHERE fh_v_id = ?`;

    // Pass leaderid first then fhid.
    const result = await db.query(query, [leaderid, fhid]);

    // Check if any rows were updated
    if (result && result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Household leader updated successfully." });
    } else {
      res.status(400).json({ message: "Failed to update household leader." });
    }
  } catch (error) {
    console.error("Error updating household leader:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/getPhoneNumbers", async (req, res) => {
  const { v_id } = req.query;

  if (!v_id) {
    return res.status(400).json({ error: "Leader ID is required" });
  }

  try {
    const query =
      "SELECT id, v_id, contact_number FROM v_contact_numbers WHERE v_id = ?";
    db.query(query, [v_id], (err, results) => {
      if (err) {
        console.error("Error fetching phone numbers:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ phone_numbers: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/addPhoneNumber", async (req, res) => {
  const { leader_id, phone_number, userid } = req.body;

  if (!leader_id || !phone_number) {
    return res
      .status(400)
      .json({ error: "Leader ID and phone number are required" });
  }

  try {
    const insertQuery =
      "INSERT INTO v_contact_numbers (v_id, contact_number, userid) VALUES (?, ?, ?)";
    db.query(insertQuery, [leader_id, phone_number, userid], (err) => {
      if (err) {
        console.error("Error inserting phone number:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Phone number added successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/deletePhoneNumber", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Phone number ID is required" });
  }

  try {
    const deleteQuery = "DELETE FROM v_contact_numbers WHERE id = ?";
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting phone number:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Phone number deleted successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getleadersliquidation", (req, res) => {
  var mun = req.query.mun;
  var brgy = req.query.brgy;
  var date = req.query.date;
  var timeFrom = req.query.timeFrom;
  var timeTo = req.query.timeTo;

  const datestring = getCurrentDate();
  const datenow = `${datestring.date}`;

  let timequery = "";
  if (timeFrom !== 0 && timeTo !== 0) {
    timequery = ` AND TIME(leader_registrations.date_registered) BETWEEN '${timeFrom}' AND '${timeTo}' `;
  }

  // console.log(mun);
  // console.log(brgy);`
  // console.log(date);
  // console.log(datenow);
  try {
    // Updated query to include leader's profile photo
    // const sql = `
    //   SELECT
    //     barangay,
    //     municipality,
    //     v_fname,
    //     v_mname,
    //     v_lname,
    //     leaders.type,
    //     record_type,
    //     v_info.v_id,
    //    imgname,
    //    TIME(leader_registrations.date_registered) as attendance_date
    //   FROM
    //     v_list.leaders
    //   INNER JOIN
    //     v_info ON v_info.v_id = leaders.v_id
    //   INNER JOIN
    //     barangays ON barangays.id = v_info.barangayId
    //     INNER JOIN
    //     v_imgtbl ON v_imgtbl.v_id = leaders.v_id
    //     INNER JOIN
    //     leader_registrations ON leader_registrations.leader_id = leaders.v_id
    //   WHERE
    //     municipality = '${mun}' and barangay = '${brgy}'
    //     AND status IS NULL
    //     AND electionyear = 2025
    // AND v_imgtbl.type = 3
    //     AND DATE(leader_registrations.date_registered) = '${date}'
    //     GROUP BY leaders.v_id
    //   ORDER BY
    //     leaders.type DESC, v_lname, v_mname ASC`;
    const sql = `
    SELECT 
      barangay, 
      municipality, 
      v_fname, 
      v_mname, 
      v_lname, 
      leaders.type, 
      record_type, 
      v_info.v_id,
     imgname,
     (SELECT remarks_txt from v_remarks INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id  WHERE v_remarks.v_id = leaders.v_id and quick_remarks.category_id = 199 order by v_remarks_id LIMIT 1) as pos,
     TIME(leader_registrations.date_registered) as attendance_date
    FROM 
      v_list.leaders 
    INNER JOIN 
      v_info ON v_info.v_id = leaders.v_id 
    INNER JOIN 
      barangays ON barangays.id = v_info.barangayId 
      LEFT JOIN
      v_imgtbl ON v_imgtbl.v_id = leaders.v_id
      LEFT JOIN 
      leader_registrations ON leader_registrations.leader_id = leaders.v_id
    WHERE 
      municipality = '${mun}' and barangay = '${brgy}'
      AND status IS NULL 
      AND electionyear = 2025
  AND v_imgtbl.type = 3
      AND DATE(leader_registrations.date_registered) = '${date}'
   ${timequery}
      GROUP BY leaders.v_id
    ORDER BY 
      leaders.type DESC, v_lname, v_mname ASC`;

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      // Modify result to include the full path for the profile image
      res.send(result); // Send the updated leaders list with photo paths
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getleadersincliquidation", (req, res) => {
  var mun = req.query.mun;
  var brgy = req.query.brgy;
  var date = req.query.date;
  var timeFrom = req.query.timeFrom;
  var timeTo = req.query.timeTo;

  var type = req.query.type;
  console.log(type);

  let typequery = "";
  if (type !== "") {
    typequery = ` AND v_remarks.remarks_id = ${type} `;
  }

  const datestring = getCurrentDate();
  const datenow = `${datestring.date}`;

  let datequery = "";
  if (date && date !== "") {
    datequery = ` AND DATE(leader_registrations.date_registered) = '${date}' `;
  }

  let timequery = "";
  if (timeFrom !== 0 && timeTo !== 0) {
    timequery = ` AND TIME(leader_registrations.date_registered) BETWEEN '${timeFrom}' AND '${timeTo}' `;
  }

  let brgyquery = "";
  if (brgy && brgy !== "") {
    brgyquery = ` AND barangay = '${brgy}' `;
  }

  // console.log(mun);
  // console.log(brgy);`
  // console.log(date);
  // console.log(datenow);
  try {
    const sql = `
    SELECT 
      barangay, 
      municipality, 
      v_fname, 
      v_mname, 
      v_lname, 
      record_type, 
      v_info.v_id,
     imgname,
      remarks_txt,
     TIME(leader_registrations.date_registered) as attendance_date
    FROM 
     leader_registrations
    INNER JOIN 
      v_info ON v_info.v_id = leader_registrations.leader_id 
    INNER JOIN 
      barangays ON barangays.id = v_info.barangayId 
      INNER JOIN
      v_imgtbl ON v_imgtbl.v_id = v_info.v_id
	LEFT JOIN v_remarks ON v_remarks.v_id = leader_registrations.leader_id
  INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id
    WHERE 
      municipality = '${mun}' ${brgyquery} ${typequery} ${datequery}
  AND v_imgtbl.type = 3
  AND quick_remarks.category_id = 199
      GROUP BY v_info.v_id
    ORDER BY 
     v_lname, v_mname ASC`;

    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }

      // Modify result to include the full path for the profile image
      res.send(result); // Send the updated leaders list with photo paths
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-survey-warding-head-of-household", (req, res) => {
  // Query to get household data with congregation and government remarks
  var mun = req.query.mun;
  var brgy = req.query.brgy;

  const query = `SELECT 
    fh_v_id, 
    CONCAT(v_lname, ', ', v_fname, ' ', v_mname) as fullname, 
    leader_v_id, 
    purok_st, 
    (SELECT remarks_txt 
     FROM v_remarks 
     INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id 
     WHERE category_id = '55' AND v_id = fh_v_id 
     ORDER BY v_remarks_id DESC LIMIT 1) as cong, 
    (SELECT remarks_txt 
     FROM v_remarks 
     INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id 
     WHERE category_id = '56' AND v_id = fh_v_id 
     ORDER BY v_remarks_id DESC LIMIT 1) as gov,
     (SELECT remarks_txt 
     FROM v_remarks 
     INNER JOIN quick_remarks ON quick_remarks.remarks_id = v_remarks.remarks_id 
     WHERE category_id = '57' AND v_id = fh_v_id 
     ORDER BY v_remarks_id DESC LIMIT 1) as vgov 
  FROM head_household 
  INNER JOIN v_info ON v_info.v_id = head_household.fh_v_id 
  INNER JOIN barangays ON barangays.id = v_info.barangayId
  WHERE municipality = '${mun}' AND barangay = '${brgy}'`;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error occurred" });
    }

    // Return the results directly to the client
    res.json({
      message: `Retrieved ${results.length} records successfully`,
      data: results,
    });
  });
});

// Express.js endpoint to check if a user has a specific tag
app.get("/checkIfHasTag", (req, res) => {
  // Get query parameters
  const { id, tag } = req.query;

  // Validate parameters
  if (!id || !tag) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters: id and tag are required",
    });
  }

  // SQL query to check if the voter has the specified tag
  const query = `
    SELECT COUNT(*) as hasTag FROM v_remarks WHERE v_id = ? AND remarks_id = ?
  `;

  // Execute the database query
  db.query(query, [id, tag], (error, results) => {
    console.log(query + " " + id + " " + tag);
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        message: "Database error occurred",
      });
    }

    // Check if the tag exists (if count > 0)
    const hasTag = results[0].hasTag > 0;

    // Return the result
    res.json({
      success: true,
      hasTag: hasTag,
    });
  });
});

app.post("/deleteAttendance", async (req, res) => {
  const { leader_id, userid, attendance_status } = req.body;

  try {
    const query = `
      DELETE from leader_registrations WHERE leader_id = ?`;

    const result = await db.query(query, [leader_id]);

    if (result) {
      res.status(200).json({ message: "Attendance marked successfully." });
    } else {
      res.status(400).json({ message: "Failed to mark attendance." });
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/deleteSign", (req, res) => {
  const voterid = req.query.vid;
  const query =
    "DELETE from v_imgtbl WHERE v_id = '" + voterid + "' AND type = 3";

  db.query(query, function (err, result) {
    if (err) throw err;
    //console.log("File name saved in database:", filename);
    // console.log(result);
    // console.log(query);
    res.send(result);
  });
  // const filePath = path.join(__dirname, 'public', 'profiles', voterId, imgname);

  // fs.unlink(filePath, (err) => {
  //   if (err) {
  //     console.error('Error deleting file:', err);
  //     return res.status(500).json({ success: false, message: 'File deletion failed.' });
  //   }

  //   res.json({ success: true, message: 'File deleted successfully.' });
  // });
});

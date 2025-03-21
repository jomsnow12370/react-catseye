const GetType = (type) => {
  console.log("TYPE FROM GETLEADER: " + type);
  var wltype;
  switch (type) {
    case 1:
      wltype = "Ward Leader";
      break;

    case 2:
      wltype = "Barangay Coordinator";
      break;

    case 3:
      wltype = "District Coordinator";
      break;
  
    case 4:
      wltype = "Municipal Coordinator";
      break;

    case 5:
      wltype = "Special OP Ward Leader";
      break;

    case 6:
      wltype = "Provincial Coordinator";
      break;

    default:
      wltype = "Undefined Type";
      break;
  }
  return wltype;
};

export default GetType;

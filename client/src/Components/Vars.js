export const fetchAndStoreIp = async () => {
  let ip = "";
  try {
    const response = await fetch("http://localhost:3002/status");
    if (response.ok) {
      // Local server is available
      ip = "http://localhost:3002";
    } else {
      // Even if the response is not OK, fall back to ngrok
      ip = "https://localhost:3002"; // Replace with your actual ngrok URL
    }
  } catch (error) {
    // If there's a network error (e.g., local server not running), use ngrok
    ip = "https://localhost:3002"; // Replace with your actual ngrok URL
  }

  // Store the IP in sessionStorage for later use
  try {
    sessionStorage.setItem("ip", ip);
    console.log("Stored IP:", ip); // Debugging output
  } catch (storageError) {
    console.error("Session Storage Error:", storageError);
  }
};

export const getIp = () => {
  return sessionStorage.getItem("ip");
};

export const getUserId = () => {
  const userData = sessionStorage.getItem("user");
  if (userData) {
    const parsedUserData = JSON.parse(userData);
    return parsedUserData.user_id;
  }
  return null;
};

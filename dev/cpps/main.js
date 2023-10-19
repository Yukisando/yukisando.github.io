// Function to update data in Firebase
function updateData(key, value) {
  // Convert "true" and "false" strings to boolean values
  if (value.toLowerCase() === "true") {
    value = true;
  } else if (value.toLowerCase() === "false") {
    value = false;
  }
  let reference = database.ref("/Live/" + key);
  reference.set(value);
  refreshData();
}

// Function to remove data from Firebase
function removeData(key) {
  let reference = database.ref("/Live/" + key);
  reference.remove().then(function () {
    refreshData();
  });
}

function setReady() {
  let reference = database.ref("/Live/Settings/sessionReady");
  
  reference.once("value").then(snapshot => {
    let isReady = snapshot.val();

    // If database is empty, reset to "Set Ready" state
    if (isReady === null) {
      updateReadyState(false);
      return;
    }

    // Toggle the value
    reference.set(!isReady);
    
    // Update the button's visual
    updateReadyState(!isReady);
    
    refreshData();
  });
}

function updateReadyState(isReady) {
  let button = document.getElementById("readyButton");
  
  if (isReady) {
    button.innerText = "Set Not Ready";
    button.classList.remove("btn-primary");
    button.classList.add("btn-danger");
  } else {
    button.innerText = "Set Ready";
    button.classList.remove("btn-danger");
    button.classList.add("btn-primary");
  }
}


function pauseGame() {
  let reference = database.ref("/Live/Settings/paused");
  reference.once("value").then((snapshot) => {
    let isPaused = snapshot.val();

    let button = document.getElementById("playButton");
    let icon = document.getElementById("playIcon");

    // Toggle the paused state
    if (!isPaused) {
      // Game is currently running, so pause it
      reference.set(true);
      button.style.backgroundColor = "#dc3545";
      icon.className = "fa fa-pause";
    } else {
      // Game is currently paused, so unpause it
      reference.set(false);
      button.style.backgroundColor = "#28a745";
      icon.className = "fa fa-play";
    }

    refreshData();
  });
}

// Ends the game
function endGame() {
  let reference = database.ref("/Live/Settings/finished");
  reference.set(true);
  refreshData();
}

//Archives the data (If a session is found)
async function clearData() {
  let reference = database.ref("/Live"); // Updated path

  let snapshot = await reference.once("value");
  let data = snapshot.val();

  if (data && data.Session) {
    // Get current Unix timestamp
    let timestamp = Date.now();

    let archiveReference = database.ref("/Archive").child(timestamp.toString()); // Updated path with timestamp

    await archiveReference.set(data);
  }

  await reference.set(null);

  refreshData();
}

//Polls the data from firebase
function refreshData() {
  let reference = database.ref("/Live");
  reference.on("value", (snapshot) => {
    let data = snapshot.val();
    let transformedData = transformDataToTree(data);
    let jstreeInstance = $("#firebaseDataTree").jstree(true);
    jstreeInstance.settings.core.data = transformedData;
    jstreeInstance.refresh();
  });

}

function updateRoutine() {
  let reference = database.ref("/Live");
  reference.once("value", (snapshot) => {
    let data = snapshot.val();

    let button = document.getElementById("playButton");
    let icon = document.getElementById("playIcon");

    if (!data) {
      // No data in the database
      document.getElementById("remainingTime").textContent = "No session is online.";
      updateReadyState(false);
      button.style.backgroundColor = "#444444"; // Yellow color
      icon.className = "fas fa-minus"; // Minus icon
    } else if (data.Settings && data.Settings.startEpoch && data.Settings.endEpoch) {
      let currentTime = Date.now() / 1000; // Get current time in seconds
      let remainingSeconds = data.Settings.endEpoch - currentTime;

      if (remainingSeconds > 0) {
        // Calculate hours, minutes, and seconds
        let hours = Math.floor(remainingSeconds / 3600);
        let minutes = Math.floor((remainingSeconds % 3600) / 60);
        let seconds = Math.floor(remainingSeconds % 60);

        // Pad the values to two digits
        let formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        document.getElementById("remainingTime").textContent =
          "Remaining Time: " + formattedTime;
        button.style.backgroundColor = "#28a745"; // Green color
        icon.className = "fa fa-play"; // Play icon
      } else {
        document.getElementById("remainingTime").textContent = "The session has ended.";
        button.style.backgroundColor = "#444444"; // Yellow color
        icon.className = "fas fa-minus"; // Minus icon
      }
    } else {
      document.getElementById("remainingTime").textContent = "Game in lobby.";
      button.style.backgroundColor = "#444444"; // Yellow color
      icon.className = "fas fa-minus"; // Minus icon
    }
  });
}

$(function () {
  // jsTree initialization
  $("#firebaseDataTree").jstree({
    core: { data: [] },
    types: {
      default: {
        icon: "fa fa-folder", // icon for keys
      },
      leaf: {
        icon: "fa fa-file", // icon for values
      },
    },
    plugins: ["types", "contextmenu"], // Add "contextmenu" to the list of plugins
    contextmenu: { items: customItems }, // Define the function to generate the context menu
  });

  // Load and refresh data for the first time
  refreshData();

  // Update remaining time every 5 seconds
  startUpdateRoutine();
});

function startUpdateRoutine() {
  setInterval(updateRoutine, 1000); // Call updateRemainingTimeOnly every 5 seconds
}

// Function to transform data to tree structure for jsTree
function transformDataToTree(data, parentId = "#") {
  let tree = [];
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      let node = {};
      node.text = key;
      node.parent = parentId;
      node.type = "default"; // default type for keys

      // Check if the current property is an object
      if (data[key] && typeof data[key] === "object") {
        // If it is an object, continue to build the tree
        node.children = transformDataToTree(data[key], key);
      } else {
        // If it is not an object, make it a leaf node
        node.children = [
          {
            text: String(data[key]),
            parent: key,
            children: [],
            type: "leaf", // leaf type for values
          },
        ];
      }
      tree.push(node);
    }
  }
  return tree;
}

function customItems(node) {
  return {
    CopyPath: {
      // Menu item
      label: "Copy Path",
      action: function () {
        var path = $("#firebaseDataTree").jstree(true).get_path(node, "/");
        navigator.clipboard
          .writeText(path)
          .then(function () {
            console.log("Path copied to clipboard: ", path);
          })
          .catch(function (error) {
            console.error("Failed to copy path: ", error);
          });
      },
    },
  };
}

function toggleAdvancedSection() {
  var advancedSection = document.getElementById("advancedSection");
  var toggleButton = document.getElementById("toggleButton");

  if (advancedSection.style.display === "none") {
    advancedSection.style.display = "block";
    toggleButton.innerHTML = "Hide Advanced Section";
  } else {
    advancedSection.style.display = "none";
    toggleButton.innerHTML = "Show Advanced Section";
  }
}
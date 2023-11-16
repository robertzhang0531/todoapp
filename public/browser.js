// function itemTemplate(item) {
//     return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
//     <span class="item-text">${item.text}</span>
//     <div>
//     <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
//     <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
//     </div>
//     </li>`
// }

// function itemTemplate(item, isSubTask = false) {
//   let itemClass = isSubTask ? "sub-task" : "";
//   return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between ${itemClass}">
//     <span class="item-text">${item.text}</span>
//     <div>
//       <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
//       <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
//     </div>
//   </li>`;
// }

function itemTemplate(item, isSubTask = false, parentId = null) {
  let itemClass = isSubTask ? "sub-task" : "";
  let dataParent = isSubTask ? `data-parent-id="${parentId}"` : "";
  let itemHTML = `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between ${itemClass}" ${dataParent}>
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`;

  if (item.subTasks && item.subTasks.length) {
    let subTasksHTML = item.subTasks.map(subTask => itemTemplate(subTask, true, item._id)).join('');
    itemHTML += `<ul>${subTasksHTML}</ul>`;
  }

  return itemHTML;
}


  
  // Initial Page Load Render
  let ourHTML = items.map(function(item) {
    return itemTemplate(item)
  }).join('')
  document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)
  
  // Create Feature
  let createField = document.getElementById("create-field")
  
  document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault()
    axios.post('/create-item', {text: createField.value}).then(function (response) {
      // Create the HTML for a new item
      document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
      createField.value = ""
      createField.focus()
    }).catch(function() {
      console.log("Please try again later.")
    })
  })
  
  document.addEventListener("click", function(e) {
    // Determine the ID of the clicked item
    let itemId = null;
    if (e.target.matches(".edit-me, .delete-me")) {
      itemId = e.target.getAttribute("data-id");
    } else if (e.target.matches(".edit-me *, .delete-me *")) {
      // If the clicked element is a child of the button
      itemId = e.target.closest(".edit-me, .delete-me").getAttribute("data-id");
    }
  
    // Proceed only if an ID was found
    if (!itemId) return;
  
    // Delete Feature
    if (e.target.classList.contains("delete-me")) {
      if (confirm("Do you really want to delete this item permanently?")) {
        let itemId = e.target.getAttribute("data-id");
        axios.post('/delete-item', {id: itemId}).then(function () {
          // Remove the parent task
          e.target.closest(".list-group-item").remove();
          // Remove all sub-tasks associated with this parent task
          document.querySelectorAll(`[data-parent-id="${itemId}"]`).forEach(subTask => subTask.remove());
        }).catch(function() {
          console.log("Please try again later.");
        });
      }
    }
  
    // Update Feature
    if (e.target.classList.contains("edit-me")) {
      let userInput = prompt("Enter your desired new text:", e.target.closest("li").querySelector(".item-text").innerHTML);
      if (userInput) {
        axios.post('/update-item', {text: userInput, id: itemId}).then(function () {
          e.target.closest("li").querySelector(".item-text").innerHTML = userInput;
        }).catch(function() {
          console.log("Please try again later.");
        });
      }
    }
  });

// // New AI-powered task breakdown feature
// document.getElementById("ai-breakdown").addEventListener("click", function() {
//   let taskDescription = prompt("Enter the task you want to break down:");
//   if (taskDescription) {
//     // Show loading message
//     document.getElementById("loading-message").style.display = "inline";

//     axios.post('/ai-breakdown', { text: taskDescription })
//       .then(function (response) {
//         // Hide loading message
//         document.getElementById("loading-message").style.display = "none";

//         // The sub-tasks are returned as an array in response.data.subTasks
//         // You can now display them in your frontend.
//         // For example, let's just add them to the bottom of our task list:
//         response.data.subTasks.forEach(subTask => {
//           // Assuming itemTemplate is a function that creates the HTML for a task
//           document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate({text: subTask}));
//         });
//       })
//       .catch(function (error) {
//         // Hide loading message in case of error
//         document.getElementById("loading-message").style.display = "none";
//         console.log("An error occurred", error);
//       });
//   } else {
//     // Hide loading message if the user cancels the prompt
//     document.getElementById("loading-message").style.display = "none";
//   }
// });

// document.getElementById("ai-breakdown").addEventListener("click", function() {
//   let taskDescription = prompt("Enter the task you want to break down:");
//   if (taskDescription) {
//     // Show loading message
//     document.getElementById("loading-message").style.display = "inline";

//     axios.post('/ai-breakdown', { text: taskDescription })
//       .then(function (response) {
//         // Hide loading message
//         document.getElementById("loading-message").style.display = "none";

//         // Add the original task
//         let originalTaskHTML = itemTemplate({text: response.data.originalTask});
//         document.getElementById("item-list").insertAdjacentHTML("beforeend", originalTaskHTML);

//         // Add sub-tasks as nested items
//         response.data.subTasks.forEach(subTask => {
//           let subTaskHTML = itemTemplate({text: subTask}, true);
//           document.getElementById("item-list").insertAdjacentHTML("beforeend", subTaskHTML);
//         });
//       })
//       .catch(function (error) {
//         document.getElementById("loading-message").style.display = "none";
//         console.log("An error occurred", error);
//       });
//   } else {
//     document.getElementById("loading-message").style.display = "none";
//   }
// });


document.getElementById("ai-breakdown").addEventListener("click", function() {
  let taskDescription = prompt("*Demo Feature: enter your task and let AI break it down for you!");
  if (taskDescription) {
    // Show loading message
    document.getElementById("loading-message").style.display = "inline";

    axios.post('/ai-breakdown', { text: taskDescription })
      .then(function (response) {
        // Hide loading message
        document.getElementById("loading-message").style.display = "none";

        // Add the original task with sub-tasks
        let taskWithSubTasksHTML = itemTemplate(response.data);
        document.getElementById("item-list").insertAdjacentHTML("beforeend", taskWithSubTasksHTML);
      })
      .catch(function (error) {
        document.getElementById("loading-message").style.display = "none";
        console.log("An error occurred", error);
      });
  } else {
    document.getElementById("loading-message").style.display = "none";
  }
});


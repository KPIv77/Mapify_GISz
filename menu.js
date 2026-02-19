// Tag menu
function menu_show() {
  // Get references to the menu elements
  const showmenu = document.querySelector(".showmenu");
  const menu = document.querySelector(".menu");
  const fileinput = document.querySelectorAll(".fileInput, .upload-area");
  
  // Check elements existence before adding event listener
  if (!showmenu || !menu || !fileinput) return; 

    // add click event listener to the showmenu button
    showmenu.addEventListener("click", () => {
      
      // Check actions button
      console.log("check");

      // Fade in/out the menu and file input options
      menu.classList.toggle("shifted");

      // Fade in/out buttons for file input
      fileinput.forEach(li => {
        li.classList.toggle("show");
      });

    });
};

// Call function
document.addEventListener("DOMContentLoaded", menu_show);

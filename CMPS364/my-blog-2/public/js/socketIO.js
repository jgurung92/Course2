
const socket = io(); // Connect to the server with Socket.IO
        
// Handle form submission
const form = document.getElementById("newCommentForm");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
        
    const postId = document.getElementById("postId").value;
    const author = document.getElementById("commentAuthor").value;
    const content = document.getElementById("commentContent").value;
        
    // Emit the new comment to the server
    socket.emit("newComment", { postId, author, content });
        
    // Clear the form fields
    form.reset();
});
        
// Listen for new comments from the server
socket.on("commentAdded", (comment) => {
    // Ensure the comment is for the current post
    const postId = document.getElementById("postId").value;
    if (comment.postId === postId) {
        const commentsDiv = document.getElementById("comments");
        const newComment = document.createElement("div");
        newComment.classList.add("comment");
        newComment.innerHTML = `<strong>${comment.author}</strong>: ${comment.content}`;
        commentsDiv.appendChild(newComment); // Add the new comment to the comments section
    }
});





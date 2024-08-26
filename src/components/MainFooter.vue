<script></script>

<template>
  <footer>
    <a class="navbar-brand" href="/">
      <img src="@/assets/img/blog-icon.svg" alt="Home" class="todo-icon" />
    </a>
    <!-- <a class="navbar-brand" href="/">Nafis To-Do</a> -->
    <!-- Social Icons -->
    <div class="social-container">
      <a href="https://www.linkedin.com/in/mohamed-hashem-a19518210" class="social">
        <i class="fab fa-linkedin-in"></i>
      </a>
      <a href="mailto:mohamed222348@bue.edu.eg" class="social">
        <i class="fas fa-envelope"></i>
      </a>
      <a href="https://github.com/mohashem3" class="social">
        <i class="fab fa-github"></i>
      </a>
    </div>

    <p>
      Created by
      <a target="_blank" href="https://www.linkedin.com/in/mohamed-hashem-a19518210">
        Mohamed Hashem
      </a>
      - VueJS Task 4
    </p>
  </footer>
</template>

<style scoped>
/* Ensure the html and body elements are full height */
html,
body {
  height: 100%;
  margin: 0;
}

/* Main content area should push the footer to the bottom */
.main-content {
  min-height: 100%;
  padding-bottom: 60px; /* Adjust this value to the height of your footer */
}

/* Footer Styling */
footer {
  background: linear-gradient(to right, #01c2cc, #7d2ae7);
  color: #fff;
  font-size: 14px;
  position: relative; /* Changed from fixed */
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px 0; /* Padding for spacing */
  z-index: 999;
  width: 101%;
}

footer p {
  margin: 10px 0;
}

footer i {
  color: #3c97bf;
}

footer a {
  color: #000000;
  text-decoration: none;
}

.social {
  background-color: #ddd;
  color: black;
}
.social-container {
  margin: 20px 0;
}

.social-container a {
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
}

.todo-icon {
  margin-top: 10px;
  width: 50px;
  height: 50px;
  vertical-align: middle;
}
</style>

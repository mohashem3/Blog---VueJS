<template>
  <div class="blog-container">
    <div class="row">
      <div class="leftcolumn">
        <div class="card">
          <h2>TITLE HEADING</h2>
          <h5>Title description, Dec 7, 2017</h5>
          <div class="fakeimg">Image</div>
          <p>Some text..</p>
          <p>
            Sunt in culpa qui officia deserunt mollit anim id est laborum consectetur adipiscing
            elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco.
          </p>
        </div>
        <div class="card">
          <h2>Article HEADING</h2>
          <h5>
            Edit Delete icons for logged in user's posts // Comments icon for all posts beside it
            comment count
          </h5>
          <div class="fakeimg">Image</div>
          <p>Article content</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.row {
  width: 100%;
  max-width: 800px;
}

.leftcolumn {
  width: 100%;
}

.card {
  background-color: white;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.fakeimg {
  background-color: #aaa;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
}

@media screen and (max-width: 800px) {
  .leftcolumn {
    width: 100%;
    padding: 0;
  }
}
</style>

<script></script>

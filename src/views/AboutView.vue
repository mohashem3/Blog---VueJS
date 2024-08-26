<template>
  <main>
    <section class="about-section">
      <div class="container">
        <div class="row">
          <div class="content-column col-lg-6 col-md-12 col-sm-12 order-2">
            <div class="inner-column">
              <div class="sec-title">
                <span class="title">About <strong>NAFIS INSIGHTS</strong></span>
                <h2>Unlocking Knowledge & Innovation</h2>
              </div>
              <div class="text">
                At Nafis Insights, we believe that knowledge is power. Our mission is to provide you
                with the information and tools you need to stay ahead in an ever-evolving world.
                Join us as we explore the latest trends, share best practices, and offer expert
                advice to help you make the most of your time and resources. Experience the
                difference that thoughtful insights can make with Nafis Insights at your side. Our
                mission is simple: to empower you with the information you need to make informed
                decisions and achieve your goals efficiently. With Nafis Insights, you'll gain the
                edge you need to stay ahead in an ever-evolving landscape.
              </div>

              <div class="btn-box">
                <a
                  v-if="isLoggedIn"
                  href="#"
                  @click.prevent="openAddPostPopup"
                  class="theme-btn btn-style-one"
                >
                  ADD POSTS
                </a>
                <a
                  v-else
                  href="#"
                  @click.prevent="toggleSignupPopup"
                  class="theme-btn btn-style-one"
                >
                  GET STARTED
                </a>
              </div>
            </div>
          </div>

          <!-- Image Column -->
          <div class="image-column col-lg-6 col-md-12 col-sm-12">
            <div class="inner-column wow fadeInLeft">
              <div class="author-desc">
                <h2>NAFIS INSIGHTS</h2>
                <span>Empowering Knowledge</span>
              </div>
              <figure class="image-1">
                <a href="#" class="lightbox-image" data-fancybox="images"
                  ><img title="Nafis To-Do" src="../assets/img/blogging.jpg" alt=""
                /></a>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Conditionally render the SignUp component -->
    <SignUp
      v-if="showSignupPopup"
      :showPopup="showSignupPopup"
      @update:showPopup="showSignupPopup = $event"
    />

    <!-- Conditionally render the AddPost component -->
    <AddPost
      v-if="showAddPostPopup"
      :showPopup="showAddPostPopup"
      @update:showPopup="showAddPostPopup = $event"
      @post-added="fetchArticles"
    />
  </main>
</template>

<script>
import SignUp from '@/components/SignUp.vue'
import AddPost from '@/components/AddPost.vue'

export default {
  components: {
    SignUp,
    AddPost
  },
  data() {
    return {
      showSignupPopup: false,
      showAddPostPopup: false,
      isLoggedIn: false // Initially set to false, you will check this value dynamically
    }
  },
  methods: {
    toggleSignupPopup() {
      this.showSignupPopup = !this.showSignupPopup
    },
    openAddPostPopup() {
      this.showAddPostPopup = true
    },
    async checkLoginStatus() {
      // Implement your login check logic here, for example:
      const token = localStorage.getItem('authToken')
      this.isLoggedIn = !!token // Set isLoggedIn based on whether a token exists
    }
  },
  async mounted() {
    await this.checkLoginStatus()
  }
}
</script>

<style scoped>
a,
a:hover,
a:focus,
a:active {
  text-decoration: none;
  outline: none;
}

a,
a:active,
a:focus {
  color: #6f6f6f;
  text-decoration: none;
  transition-timing-function: ease-in-out;
  -ms-transition-timing-function: ease-in-out;
  -moz-transition-timing-function: ease-in-out;
  -webkit-transition-timing-function: ease-in-out;
  -o-transition-timing-function: ease-in-out;
  transition-duration: 0.2s;
  -ms-transition-duration: 0.2s;
  -moz-transition-duration: 0.2s;
  -webkit-transition-duration: 0.2s;
  -o-transition-duration: 0.2s;
}

.image-1 img {
  width: 74%; /* Adjust the width as needed */
  height: auto; /* Maintains the aspect ratio */
  max-width: 100%; /* Ensures the image doesn't exceed its container */
  border-radius: 10px; /* Optional: for rounded corners */
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
img {
  max-width: 100%;
  height: auto;
}
section {
  padding: 60px 0;
  /* min-height: 100vh;*/
}

.sec-title {
  position: relative;
  z-index: 1;
  margin-bottom: 60px;
}

.sec-title .title {
  position: relative;
  display: block;
  font-size: 18px;
  line-height: 24px;
  color: linear-gradient(to right, #01c2cc, #7d2ae7);
  font-weight: 500;
  margin-bottom: 15px;
}

.sec-title h2 {
  position: relative;
  display: block;
  font-size: 40px;
  line-height: 1.28em;
  color: #222222;
  font-weight: 600;
  padding-bottom: 18px;
}

.sec-title h2:before {
  position: absolute;
  content: '';
  left: 0px;
  bottom: 0px;
  width: 50px;
  height: 3px;
  background-color: #d1d2d6;
}

.sec-title .text {
  position: relative;
  font-size: 16px;
  line-height: 26px;
  color: #848484;
  font-weight: 400;
  margin-top: 35px;
}

.sec-title.light h2 {
  color: #ffffff;
}

.sec-title.text-center h2:before {
  left: 50%;
  margin-left: -25px;
}

.list-style-one {
  position: relative;
}

.list-style-one li {
  position: relative;
  font-size: 16px;
  line-height: 26px;
  color: #222222;
  font-weight: 400;
  padding-left: 35px;
  margin-bottom: 12px;
}

.list-style-one li:before {
  content: '\f058';
  position: absolute;
  left: 0;
  top: 0px;
  display: block;
  font-size: 18px;
  padding: 0px;
  color: #ff2222;
  font-weight: 600;
  -moz-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1.6;
  font-family: 'Font Awesome 5 Free';
}

.list-style-one li a:hover {
  color: #44bce2;
}

.btn-style-one {
  position: relative;
  display: inline-block;
  font-size: 17px;
  line-height: 30px;
  color: #ffffff;
  padding: 10px 30px;
  font-weight: 600;
  overflow: hidden;
  letter-spacing: 0.02em;
  background: linear-gradient(to right, #01c2cc, #7d2ae7);
  border-radius: 30px;
}

.btn-style-one:hover {
  background: linear-gradient(to right, #7d2ae7, #01c2cc);
  color: #ffffff;
}
.about-section {
  position: relative;
  padding: 120px 0 70px;
}

.about-section .sec-title {
  margin-bottom: 45px;
}

.about-section .content-column {
  position: relative;
  margin-bottom: 50px;
}

.about-section .content-column .inner-column {
  position: relative;
  padding-left: 30px;
}

.about-section .text {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 26px;
  color: #848484;
  font-weight: 400;
}

.about-section .list-style-one {
  margin-bottom: 45px;
}

.about-section .btn-box {
  position: relative;
}

.about-section .btn-box a {
  padding: 15px 50px;
}

.about-section .image-column {
  position: relative;
}

.about-section .image-column .text-layer {
  position: absolute;
  right: -110px;
  top: 50%;
  font-size: 325px;
  line-height: 1em;
  color: #ffffff;
  margin-top: -175px;
  font-weight: 500;
}

.about-section .image-column .inner-column {
  position: relative;
  padding-left: 80px;
  padding-bottom: 0px;
  margin-bottom: 200px;
}
.about-section .image-column .inner-column .author-desc {
  position: absolute;
  bottom: 16px;
  z-index: 1;
  background: rgb(86, 54, 194);
  padding: 10px 15px;
  left: 96px;
  width: calc(100% - 250px);
  border-radius: 50px;
}
.about-section .image-column .inner-column .author-desc h2 {
  font-size: 21px;
  letter-spacing: 1px;
  text-align: center;
  color: #fff;
  margin: 0;
}
.about-section .image-column .inner-column .author-desc span {
  font-size: 16px;
  letter-spacing: 6px;
  text-align: center;
  color: #fff;
  display: block;
  font-weight: 400;
}
.about-section .image-column .inner-column:before {
  content: '';
  position: absolute;
  width: calc(50% + 80px);
  height: calc(100% + 160px);
  top: -80px;
  left: -3px;
  background: transparent;
  z-index: 0;
  border: 44px solid #95c7ea;
}

.about-section .image-column .image-1 {
  position: relative;
}
.about-section .image-column .image-2 {
  position: absolute;
  left: 0;
  bottom: 0;
}

.about-section .image-column .image-2 img,
.about-section .image-column .image-1 img {
  box-shadow: 0 30px 50px rgba(8, 13, 62, 0.15);
  border-radius: 46px;
}

.about-section .image-column .video-link {
  position: absolute;
  left: 70px;
  top: 170px;
}

.about-section .image-column .video-link .link {
  position: relative;
  display: block;
  font-size: 22px;
  color: #191e34;
  font-weight: 400;
  text-align: center;
  height: 100px;
  width: 100px;
  line-height: 100px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 30px 50px rgba(8, 13, 62, 0.15);
  -webkit-transition: all 300ms ease;
  -moz-transition: all 300ms ease;
  -ms-transition: all 300ms ease;
  -o-transition: all 300ms ease;
  transition: all 300ms ease;
}

.about-section .image-column .video-link .link:hover {
  background-color: #191e34;
  color: #fff;
}
</style>

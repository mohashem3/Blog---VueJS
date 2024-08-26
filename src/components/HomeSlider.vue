<template>
  <div class="slider-container">
    <swiper
      :slidesPerView="1"
      :spaceBetween="30"
      :loop="true"
      :pagination="{ clickable: true }"
      :navigation="true"
      :modules="modules"
      class="mySwiper"
    >
      <swiper-slide class="first-slider">
        <div class="left-section">
          <h1 class="title"><strong>Human Stories & Ideas</strong></h1>
          <p class="subtitle">A place to read & deepen your understanding</p>
          <button class="cta-button" @click="showSignUpPopup = true">GET STARTED</button>
        </div>
        <div class="right-section">
          <img
            src="../assets/img/blog-welcome.png"
            alt="Description of image"
            class="slide-image"
          />
        </div>
      </swiper-slide>

      <swiper-slide class="first-slider">
        <div class="left-section">
          <h1 class="title"><strong>Write & Edit Your Posts</strong></h1>
          <p class="subtitle">Create and manage your own content effortlessly.</p>
          <button class="cta-button" @click="showSignUpPopup = true">START POSTING</button>
        </div>
        <div class="right-section">
          <img
            src="../assets/img/blog-welcome.png"
            alt="Description of image"
            class="slide-image"
          />
        </div>
      </swiper-slide>

      <swiper-slide class="first-slider">
        <div class="left-section">
          <h1 class="title"><strong>Contribute with Comments</strong></h1>
          <p class="subtitle">Engage with others by sharing your thoughts.</p>
          <button class="cta-button" @click="showSignUpPopup = true">JOIN THE CONVERSATION</button>
        </div>
        <div class="right-section">
          <img
            src="../assets/img/blog-welcome.png"
            alt="Description of image"
            class="slide-image"
          />
        </div>
      </swiper-slide>
    </swiper>

    <!-- Sign-Up Popup -->
    <SignUp :showPopup="showSignUpPopup" @update:showPopup="showSignUpPopup = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Pagination, Navigation } from 'swiper/modules'
import SignUp from './SignUp.vue' // Ensure the correct path

const modules = [Pagination, Navigation]
const showSignUpPopup = ref(false)
</script>

<style scoped>
.slider-container {
  width: 90%; /* Adjust the width as needed */
  max-width: 1100px; /* Set a max width if needed */
  margin: 20px auto; /* Center the slider with margin from other components */
  padding: 10px; /* Add padding around the slider */
}

.mySwiper {
  height: 400px; /* Increase the height of the slider */
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.first-slider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #b073ff, #75f8ff);
  padding: 20px; /* Adjust padding as needed */
}

.left-section {
  max-width: 50%;
  padding: 25px;
}

.right-section {
  max-width: 50%;
  padding: 25px;
  display: flex;
  justify-content: center;
}

.title {
  font-size: 2rem;
  color: white;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.25rem;
  color: white;
  margin-bottom: 20px;
}

.cta-button {
  padding: 10px 20px;
  font-size: 1rem;
  color: white;
  background-color: #ff4081; /* Customize button color */
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.slide-image {
  max-width: 100%;
  height: auto;
}
</style>

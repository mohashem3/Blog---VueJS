<template>
  <div class="static-welcome-container">
    <div class="left-section">
      <h1 class="title">Welcome, {{ userName }}</h1>
      <p class="subtitle">Start posting your blogs now!</p>
      <button class="cta-button" @click="showAddPostPopup">START POSTING</button>
    </div>
    <div class="right-section">
      <img src="../assets/img/blog-welcome.png" alt="Description of image" class="slide-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'

const userName = ref('')
const emit = defineEmits(['showAddPostPopup'])

const fetchUserName = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name
  } else {
    console.error('User data not found in local storage')
  }
}

const showAddPostPopup = () => {
  emit('showAddPostPopup')
}

onMounted(() => {
  fetchUserName()
})
</script>

<style scoped>
.static-welcome-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #b073ff, #75f8ff);
  height: 400px; /* Ensure this matches the slider height */
  width: 90%; /* Adjust width to match slider */
  max-width: 1100px; /* Adjust max-width to match slider */
  margin: 50px auto; /* Add top and bottom margin for spacing */
  padding: 20px;
  box-sizing: border-box;
  border-radius: 15px;
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

.cta-button:hover {
  background-color: #02c0cc;
}

.slide-image {
  max-width: 100%;
  height: auto;
}
</style>

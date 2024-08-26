<template>
  <main>
    <HomeSlider v-if="!isLoggedIn" />
    <StaticWelcome v-if="isLoggedIn" @showAddPostPopup="showAddPostPopup = true" />
    <HorizontalCard v-if="isLoggedIn" />
    <InfoCard v-if="!isLoggedIn" @showSignUpPopup="showSignUpPopup = true" />
    <SignUp :showPopup="showSignUpPopup" @update:showPopup="showSignUpPopup = $event" />
    <AddPost
      :showPopup="showAddPostPopup"
      @update:showPopup="showAddPostPopup = $event"
      @post-added="fetchArticles"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HomeSlider from '../components/HomeSlider.vue'
import StaticWelcome from '../components/StaticWelcome.vue'
import InfoCard from '../components/InfoCard.vue'
import SignUp from '../components/SignUp.vue'
import HorizontalCard from '../components/HorizontalCard.vue'
import AddPost from '../components/AddPost.vue'

// Authentication state
const isLoggedIn = ref(false)
const showSignUpPopup = ref(false)
const showAddPostPopup = ref(false)

// Check authentication status on component mount
const checkAuth = () => {
  const token = localStorage.getItem('authToken')
  isLoggedIn.value = !!token // Set isLoggedIn to true if token exists
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped></style>

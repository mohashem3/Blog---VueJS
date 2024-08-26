<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import LogIn from '@/components/LogIn.vue'
import SignUp from '@/components/SignUp.vue'

const router = useRouter()

const showLoginPopup = ref(false)
const showSignupPopup = ref(false)
const isLoggedIn = ref(!!localStorage.getItem('authToken'))

const toggleLoginPopup = () => {
  showLoginPopup.value = !showLoginPopup.value
}

const toggleSignupPopup = () => {
  showSignupPopup.value = !showSignupPopup.value
}

const logout = () => {
  localStorage.removeItem('authToken')
  isLoggedIn.value = false
  Swal.fire({
    icon: 'success',
    title: 'Logged Out',
    text: 'You have successfully logged out!',
    confirmButtonText: 'OK'
  }).then(() => {
    router.push('/').then(() => {
      router.go(0)
    })
  })
}

const handleLoginSuccess = () => {
  const intendedRoute = localStorage.getItem('intendedRoute') || '/'
  localStorage.removeItem('intendedRoute')
  isLoggedIn.value = true
  router.push(intendedRoute)
}

onMounted(() => {
  window.addEventListener('show-login-popup', toggleLoginPopup)
})

onBeforeUnmount(() => {
  window.removeEventListener('show-login-popup', toggleLoginPopup)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container d-flex justify-content-between align-items-center position-relative">
      <!-- Left section (Logo and Brand) -->
      <div class="navbar-left d-flex align-items-center">
        <a class="navbar-brand" href="/">
          <img src="@/assets/img/blog-icon.svg" alt="Home" class="todo-icon" />
        </a>
        <a class="navbar-brand" href="/"><strong>NAFIS INSIGHTS</strong></a>
      </div>

      <!-- Center Links -->
      <div class="navbar-center position-absolute start-50 translate-middle-x">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">HOME</router-link>
          </li>

          <li class="nav-item">
            <router-link to="/about" class="nav-link" exact-active-class="active"
              >ABOUT</router-link
            >
          </li>
        </ul>
      </div>

      <!-- Right Links -->
      <div class="navbar-right d-flex">
        <ul class="navbar-nav ms-auto">
          <li v-if="!isLoggedIn" class="nav-item">
            <a class="nav-link custom-nav-link" @click.prevent="toggleLoginPopup">LOG IN</a>
          </li>
          <li v-if="!isLoggedIn" class="nav-item">
            <a class="nav-link custom-nav-link" @click.prevent="toggleSignupPopup">SIGN UP</a>
          </li>
          <li v-if="isLoggedIn" class="nav-item">
            <a class="nav-link custom-nav-link-logout" @click.prevent="logout">
              <span class="material-icons">logout</span> LOG OUT
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Login and SignUp Popups -->
    <LogIn
      :showPopup="showLoginPopup"
      @update:showPopup="showLoginPopup = $event"
      @login-success="handleLoginSuccess"
    />
    <SignUp :showPopup="showSignupPopup" @update:showPopup="showSignupPopup = $event" />
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(to right, #01c2cc, #7d2ae7);
  width: 100%;
}
.todo-icon {
  width: 60px;
  height: 60px;
  vertical-align: middle;
}
.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
}
.navbar-center {
  text-align: center;
}
.navbar-center ul {
  display: flex;
  justify-content: center;
}
.nav-link {
  color: white;
  cursor: pointer;
}
.nav-link:hover {
  color: #fff;
  cursor: pointer;
}
.nav-link.active {
  color: #fff;
}

/* Custom styles for the Sign Up, Login, and Logout links */
.custom-nav-link-logout {
  background-color: #ff4081;
  color: white !important;
  padding: 5px 15px;
  border-radius: 5px;
  width: 110px;
  text-align: center;
  margin-right: 10px;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.custom-nav-link {
  background-color: #ff4081;
  color: white !important;
  padding: 5px 15px;
  border-radius: 5px;
  width: 90px;
  text-align: center;
  margin-right: 10px;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.custom-nav-link:hover {
  background-color: #02c0cc;
  color: white !important;
}

.custom-nav-link-logout:hover {
  background-color: #02c0cc;
  color: white !important;
}

/* Adjust Logout link icon styling */
.material-icons {
  vertical-align: middle;
  margin-right: 1px;
  font-size: 20px;
}

.navbar-right .nav-item:last-child .custom-nav-link {
  margin-right: 0;
}
</style>

<template>
  <div v-if="props.showPopup" class="overlay" @click.self="closePopup">
    <div class="wrapper animate">
      <div class="title">LOG IN</div>
      <form @submit.prevent="login">
        <div class="field">
          <input type="text" required v-model="email" />
          <label>Email Address</label>
        </div>
        <div class="field">
          <input type="password" required v-model="password" />
          <label>Password</label>
        </div>
        <div class="field login-button">
          <input type="submit" :disabled="loading" value="Login" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import type { Login } from '../types/types.ts' // Import the Login type

// Define props using TypeScript
const props = defineProps<{
  showPopup: boolean
}>()

// Define emits for communicating with the parent component
const emit = defineEmits<{
  (event: 'update:showPopup', value: boolean): void
  (event: 'login-success'): void
}>()

// Reactive state variables
const email = ref<string>('')
const password = ref<string>('')
const loading = ref<boolean>(false)

// Login function
const login = async () => {
  loading.value = true // Set loading state

  try {
    const loginPayload: Login = {
      email: email.value,
      password: password.value
    }

    const response = await axios.post<{ token: string }>(
      'https://interns-blog.nafistech.com/api/login',
      loginPayload
    )

    const { token } = response.data
    localStorage.setItem('authToken', token) // Save token

    // Fetch user data
    const userResponse = await axios.get('https://interns-blog.nafistech.com/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const user = userResponse.data // Save the whole user object
    localStorage.setItem('user', JSON.stringify(user)) // Save user object in localStorage

    emit('update:showPopup', false) // Close login popup
    emit('login-success') // Notify parent component (NavBar)

    await Swal.fire({
      icon: 'success',
      title: 'LogIn Successful!',
      text: 'You have successfully logged in.',
      showConfirmButton: true
    })

    window.location.reload() // Refresh the page after clicking OK
  } catch {
    await Swal.fire({
      icon: 'error',
      title: 'LogIn Failed',
      text: 'Invalid email or password.',
      showConfirmButton: true
    })
  } finally {
    loading.value = false // Reset loading state
  }
}

// Close popup function
const closePopup = () => {
  emit('update:showPopup', false)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

button {
  padding: 10px 20px;
  background-color: #4158d0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Dark overlay background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Ensure the overlay is on top */
}

.wrapper {
  width: 380px;
  background: transparent; /* Remove the white background */
  border-radius: 15px;
  box-shadow: none; /* Remove box shadow */
  padding: 20px;
  position: relative;
  z-index: 10000; /* Ensure the wrapper is on top of the overlay */
}

.wrapper .title {
  font-size: 35px;
  font-weight: 600;
  text-align: center;
  line-height: 100px;
  color: #fff;
  border-radius: 15px 15px 0 0;
  background: linear-gradient(to right, #01c2cc, #7d2ae7);
}

form {
  background-color: white; /* Keep form background white for contrast */
  padding: 10px 30px 50px 30px;
  border-radius: 0px 0px 15px 15px;
}

.field {
  margin-top: 20px;
  position: relative;
}

.field input {
  width: 100%;
  padding-left: 20px;
  font-size: 17px;
  height: 50px;
  border: 1px solid lightgrey;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.field input[type='submit']:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
}

.login-button input {
  padding-left: 0px;
}

.field input:focus,
.field input:valid {
  border-color: #3c97bf;
}

.field label {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  color: #999999;
  font-weight: 400;
  font-size: 17px;
  transition: all 0.3s ease;
}

.field input:focus ~ label,
.field input:valid ~ label {
  top: 0;
  font-size: 16px;
  color: #3c97bf;
  background: white;
  padding: 0 5px;
  transform: translateY(-50%);
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.pass-link a {
  text-decoration: none;
  color: #3c97bf;
}

.field input[type='submit'] {
  width: 100%;
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  border: none;
  color: white;
  font-size: 20px;
  border-radius: 25px;
  cursor: pointer;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
}

.signup-link a {
  color: #3c97bf;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Animation */
.animate {
  animation: popup 0.4s ease;
}

@keyframes popup {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.spinner {
  width: 25px;
  height: 25px;
  border: 4px solid white;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

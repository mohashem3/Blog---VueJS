<template>
  <div v-if="props.showPopup" class="overlay" @click.self="closePopup">
    <div class="wrapper animate">
      <div class="title">SIGN UP</div>
      <form ref="form" @submit.prevent="validateForm">
        <div class="field">
          <input
            type="text"
            v-model="name"
            required
            pattern=".+"
            title="Please fill out this field."
          />
          <label>Full Name</label>
        </div>
        <div class="field">
          <input
            type="email"
            v-model="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address."
          />
          <label>Email Address</label>
        </div>
        <div class="field">
          <input
            type="password"
            v-model="password"
            required
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}"
            title="Password must be at least 8 characters, including uppercase and lowercase letters, a number, and a special character."
          />
          <label>Password</label>
        </div>
        <div class="field">
          <input
            type="password"
            v-model="confirmpassword"
            required
            :pattern="password"
            title="Passwords must match."
          />
          <label>Confirm Password</label>
        </div>
        <div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Create an account</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import axios from 'axios'
import type { User, Register } from '../types/types.ts' // Import the Register type

const props = defineProps<{
  showPopup: boolean
}>()

const emit = defineEmits<{
  (event: 'update:showPopup', value: boolean): void
}>()

const router = useRouter()

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmpassword = ref<string>('')
const loading = ref<boolean>(false)

const validateForm = () => {
  const form = document.forms[0] as HTMLFormElement
  if (form.checkValidity()) {
    if (password.value !== confirmpassword.value) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }
    signup()
  } else {
    form.reportValidity() // Show validation messages
  }
}

const signup = async () => {
  loading.value = true // Set loading state

  try {
    const requestData: Register = {
      email: email.value,
      name: name.value,
      password: password.value,
      password_confirmation: confirmpassword.value
    }

    // Send signup request
    const response = await axios.post<{ token: string }>(
      'https://interns-blog.nafistech.com/api/register',
      requestData
    )

    const { token } = response.data
    localStorage.setItem('authToken', token) // Save token

    // Fetch user data using the obtained token
    const userResponse = await axios.get<User>('https://interns-blog.nafistech.com/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const user = userResponse.data
    localStorage.setItem('user', JSON.stringify(user)) // Save user object in localStorage

    Swal.fire({
      title: 'Success',
      text: 'Account created successfully!',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then(() => {
      emit('update:showPopup', false) // Close signup popup
      router.go(0) // Refresh the page
    })
  } catch (error) {
    let errorMessage = 'Failed to create account.'

    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data.message) {
        errorMessage = error.response.data.message
      }
    } else {
      console.error('Unexpected error:', error)
    }

    Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false // Reset loading state
  }
}

const closePopup = () => {
  emit('update:showPopup', false)
}
</script>

<style scoped>
/* Remove custom error message styles */

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
  margin-bottom: 20px;
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
  padding-bottom: 17px;
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

.submit-btn {
  width: 100%;
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  border: none;
  color: white;
  font-size: 20px;
  border-radius: 25px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 1s ease;
}

.submit-btn:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
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

.submit-btn:hover {
  background-color: #3c97bf;
}

.submit-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  border-top: 2px solid #3c97bf;
  width: 14px;
  height: 14px;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

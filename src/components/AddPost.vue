<template>
  <div v-if="showPopup" class="overlay" @click.self="closePopup">
    <div class="wrapper animate">
      <div class="title">{{ isEditing ? 'Edit Post' : 'Add Post' }}</div>
      <form @submit.prevent="submitPost">
        <div class="field">
          <input type="text" required v-model="title" />
          <label>Enter Article Title</label>
        </div>
        <div class="field">
          <textarea required v-model="content"></textarea>
          <label>Enter Article Content</label>
        </div>
        <div class="field action-buttons">
          <button type="submit" :disabled="loading" class="submit-button">
            {{ isEditing ? 'Save Changes' : 'Add Post' }}
          </button>
          <button type="button" @click="cancel" class="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const props = defineProps({
  showPopup: Boolean,
  postData: Object
})

const emit = defineEmits(['update:showPopup', 'post-added'])

const title = ref('')
const content = ref('')
const loading = ref(false)
const isEditing = ref(false)

watch(
  () => props.postData,
  (newVal) => {
    if (newVal) {
      title.value = newVal.title
      content.value = newVal.content
      isEditing.value = true
    } else {
      title.value = ''
      content.value = ''
      isEditing.value = false
    }
  }
)

const submitPost = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    if (isEditing.value) {
      await axios.patch(
        `https://interns-blog.nafistech.com/api/posts/${props.postData.slug}`,
        {
          title: title.value,
          content: content.value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      Swal.fire({
        icon: 'success',
        title: 'Post Updated!',
        text: 'Your post has been successfully updated.'
      })
    } else {
      await axios.post(
        'https://interns-blog.nafistech.com/api/posts',
        {
          title: title.value,
          content: content.value,
          author: 'currentUser' // Replace with logic to get the current user's name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      Swal.fire({
        icon: 'success',
        title: 'Post Added!',
        text: 'Your post has been successfully added.'
      })
    }

    emit('update:showPopup', false)
    emit('post-added')
  } catch (error) {
    console.error('Error saving post:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'There was an error saving the post.'
    })
  } finally {
    loading.value = false
  }
}

const cancel = () => {
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.wrapper {
  width: 500px;
  height: 500px;
  background: transparent;
  border-radius: 15px;
  padding: 20px;
  position: relative;
  z-index: 10000;
}

.wrapper .title {
  font-size: 35px;
  font-weight: 600;
  text-align: center;
  line-height: 100px;
  color: #fff;
  background: linear-gradient(to right, #01c2cc, #7d2ae7);
}

form {
  background-color: white;
  padding: 20px;
  border-radius: 0px;
}

.field {
  margin-top: 20px;
  position: relative;
}

.field input,
.field textarea {
  width: 100%;
  padding: 15px;
  font-size: 17px;
  border: 1px solid lightgrey;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.field textarea {
  height: 150px; /* Bigger height for description */
  resize: none;
}

.field input[type='submit']:hover,
.field button.cancel-button:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
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
.field input:valid ~ label,
.field textarea:focus ~ label,
.field textarea:valid ~ label {
  top: 0;
  font-size: 16px;
  color: #3c97bf;
  background: white;
  padding: 0 5px;
  transform: translateY(-50%);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-button {
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  color: white;
  font-size: 20px;
}

.cancel-button {
  background: #f44336; /* Red color for cancel button */
  color: white;
  font-size: 20px;
}
</style>

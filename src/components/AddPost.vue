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
        <div class="file-upload">
          <!-- <button class="file-upload-btn" type="button" @click="triggerFileInput">Add Image</button> -->
          <div class="image-upload-wrap">
            <input
              class="file-upload-input"
              type="file"
              @change="readURL"
              accept="image/*"
              ref="fileInput"
            />
          </div>
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
const imageSrc = ref<string | null>(null)
const loading = ref(false)
const isEditing = ref(false)

watch(
  () => props.postData,
  (newVal) => {
    if (newVal) {
      title.value = newVal.title
      content.value = newVal.content
      imageSrc.value = newVal.image // Set the image if editing
      isEditing.value = true
    } else {
      title.value = ''
      content.value = ''
      imageSrc.value = null
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

    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('content', content.value)

    if (imageFile.value) {
      formData.append('image', imageFile.value) // Append the file for 'img'
      formData.append('image_thumb', imageFile.value) // Append the file for 'img_thumb'
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data' // Important for file uploads
    }

    if (isEditing.value) {
      await axios.patch(
        `https://interns-blog.nafistech.com/api/posts/${props.postData.slug}`,
        formData,
        { headers }
      )
      Swal.fire({
        icon: 'success',
        title: 'Post Updated!',
        text: 'Your post has been successfully updated.'
      })
    } else {
      await axios.post('https://interns-blog.nafistech.com/api/posts', formData, { headers })
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

const imageFile = ref<File | null>(null)

const readURL = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    imageFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      imageSrc.value = e.target?.result as string // Show preview
    }
    reader.readAsDataURL(file)
  } else {
    removeUpload() // Handle case when no file is selected
  }
}

const removeUpload = () => {
  imageSrc.value = null
  ;(refs.fileInput as HTMLInputElement).value = ''
  imageFile.value = null
}

const triggerFileInput = () => {
  ;(refs.fileInput as HTMLInputElement).click()
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
  height: auto;
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

.file-upload-input {
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  color: white;
  font-size: 15px;
}

.file-upload {
  margin-top: 20px;
  background-color: #ffffff;
  width: 100%;
}

.file-upload-btn {
  width: 100%;
  margin-bottom: 20px; /* Add space between button and image container */
  color: #fff;
  background: #01c2cc;
  border: none;
  padding: 10px;
  border-radius: 5px;
  border-bottom: 4px solid #0097a7;
  transition: all 0.2s ease;
  outline: none;
  text-transform: uppercase;
  font-weight: 700;
}

.file-upload-btn:hover {
  background: #0097a7;
}

.file-upload-btn:active {
  background: #007e8a;
}

.image-upload-wrap {
  position: relative;
  width: 100%;
  height: 100px; /* Ensure this height matches your container */
  border: 2px dashed #01c2cc;
  border-radius: 5px;
  overflow: hidden;
  background: #f3f3f3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-text {
  color: #01c2cc;
  font-weight: 600;
  font-size: 18px;
}

.file-upload-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.file-upload-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.image-title-wrap {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-image {
  background: #f44336; /* Red color for remove button */
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.remove-image:hover {
  background: #c62828; /* Darker red on hover */
}

.remove-image .image-title {
  font-size: 14px;
  font-weight: 500;
}
</style>

<template>
  <div v-if="isOpen" class="comment-section">
    <div class="comment-section-sidebar">
      <button class="close-button" @click="$emit('close')">
        <img :src="cancelIcon" alt="Cancel Icon" class="cancel-icon" />
      </button>
      <form @submit.prevent="submitComment" class="comment-form">
        <div class="field">
          <input
            type="text"
            required
            v-model="commentContent"
            :class="{ highlight: isEditing }"
            ref="commentInput"
          />
          <label v-if="!isEditing">Comment</label>
        </div>
        <button type="submit" class="add-comment-button" v-if="!isEditing">Add Comment</button>
        <button v-if="isEditing" @click.prevent="updateComment" class="add-comment-button">
          Update Comment
        </button>
        <button v-if="isEditing" @click.prevent="cancelEdit" class="cancel-button">Cancel</button>
      </form>

      <h3>Comments</h3>
      <div v-if="comments.length" class="comments-list">
        <div v-for="comment in comments.slice().reverse()" :key="comment.id" class="comment-card">
          <div class="comment-card__header">
            <span class="material-symbols-outlined">account_circle</span>
            <span class="comment-card__author">{{ comment.user?.name }}</span>
          </div>
          <div class="comment-card__content">
            <p
              :class="{ 'highlight-text': editedCommentId === comment.id }"
              class="comment-card__text"
            >
              {{ comment.content }}
            </p>
            <button class="show-replies-button">
              {{ 'Show Replies' }}
            </button>
          </div>

          <div class="comment-card__actions">
            <img
              v-if="canEditComment(comment)"
              @click="startEdit(comment)"
              width="18"
              height="18"
              src="https://img.icons8.com/metro/26/000000/edit.png"
              alt="Edit Comment"
              class="action-icon"
            />
            <img
              v-if="canDeleteComment(comment)"
              @click="deleteComment(comment.id)"
              width="21"
              height="21"
              src="https://img.icons8.com/windows/32/000000/trash.png"
              alt="Delete Comment"
              class="action-icon"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import cancelIcon from '../assets/img/cancel-icon.svg'
import type { Comment, User } from '../types/types.ts'
import axios from 'axios'

const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    required: true
  },
  comments: {
    type: Array as () => Comment[],
    default: () => []
  },
  postOwnerId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'update-comments'])

const commentContent = ref<string>('')
const isEditing = ref<boolean>(false)
const editedCommentId = ref<number | null>(null)
const userId = ref<number | null>(null)

const getAuthToken = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    console.error('No auth token found')
  }
  return token
}

const fetchUserInfo = async () => {
  try {
    const token = getAuthToken()
    if (!token) return

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user: User = JSON.parse(storedUser)
      userId.value = user.id
    } else {
      const userResponse = await axios.get<User>('https://interns-blog.nafistech.com/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      userId.value = userResponse.data.id
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
  }
}

const submitComment = async () => {
  try {
    const token = getAuthToken()
    if (!token) return

    const response = await axios.post<{ data: Comment }>(
      `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments`,
      { content: commentContent.value },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (response.data.data) {
      const newComment = response.data.data
      newComment.user = { id: userId.value } as User

      emit('update-comments', [...props.comments, newComment]) // Emit updated comments
      commentContent.value = ''
    } else {
      console.error('Failed to add comment')
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
  }
}

const startEdit = (comment: Comment) => {
  isEditing.value = true
  editedCommentId.value = comment.id ?? null
  commentContent.value = comment.content
  nextTick(() => {
    const inputElement = document.querySelector('input') as HTMLInputElement
    inputElement?.scrollIntoView({ behavior: 'smooth' })
    inputElement?.classList.add('highlight')
  })
}

const updateComment = async () => {
  if (editedCommentId.value === null) return

  try {
    const token = getAuthToken()
    if (!token) return

    await axios.put(
      `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments/${editedCommentId.value}`,
      { content: commentContent.value },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const updatedComments = props.comments.map((comment) =>
      comment.id === editedCommentId.value ? { ...comment, content: commentContent.value } : comment
    )
    emit('update-comments', updatedComments)

    commentContent.value = ''
    isEditing.value = false
    editedCommentId.value = null

    nextTick(() => {
      const updatedCommentElement = document.querySelector(
        `.comment-card__text.highlight-text`
      ) as HTMLElement
      updatedCommentElement?.scrollIntoView({ behavior: 'smooth' })
      updatedCommentElement?.classList.add('highlight')
    })
  } catch (error) {
    console.error('Error updating comment:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedCommentId.value = null
  commentContent.value = ''
}

const deleteComment = async (commentId: number) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  })

  if (isConfirmed) {
    try {
      const token = getAuthToken()
      if (!token) return

      await axios.delete(
        `https://interns-blog.nafistech.com/api/posts/${props.slug}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const updatedComments = props.comments.filter((c) => c.id !== commentId)
      emit('update-comments', updatedComments)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }
}

const canEditComment = (comment: Comment) => {
  // Conditions for showing edit icon:
  // 1. Post is mine and comment is mine
  // 2. Post is not mine and comment is mine
  return (
    (props.postOwnerId === userId.value && comment.user?.id === userId.value) || // Post and comment are both owned by the user
    (props.postOwnerId !== userId.value && comment.user?.id === userId.value) // Post is not owned by the user, but comment is
  )
}

const canDeleteComment = (comment: Comment) => {
  // Conditions for showing delete icon:
  // 1. Post is mine and comment is mine
  // 2. Post is mine and comment is not mine
  return (
    (props.postOwnerId === userId.value && comment.user?.id === userId.value) || // Post and comment are both owned by the user
    (props.postOwnerId === userId.value && comment.user?.id !== userId.value) ||
    (props.postOwnerId !== userId.value && comment.user?.id === userId.value) // Post is owned by the user, but comment is not
  )
}

// Fetch user info when the component is mounted or the `isOpen` prop changes
onMounted(async () => {
  if (props.isOpen) {
    await fetchUserInfo()
  }
})

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      await fetchUserInfo()
    }
  }
)
</script>

<style scoped>
.comment-section {
  position: fixed;
  right: 0;
  top: 0;
  width: 35%;
  height: 100%;
  background-color: #f4f4f4;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.comment-section-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative; /* Ensure close button is positioned relative to this container */
}

.show-replies-button {
  padding: 1px 10px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 10px;
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  color: white;
  position: absolute;
  bottom: 10px; /* Adjusted positioning relative to each comment card */
  left: 10px;
}

.show-replies-button:hover {
  background: linear-gradient(-135deg, #7d2ae7, #01c2cc);
  color: white;
}

.close-button {
  background: #ff1100;
  color: white;
  padding: 7px 7px;
  padding-top: 0px;
  padding-bottom: 0px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 17px;
}

.comment-form {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  margin-top: 60px; /* Ensure space between the form and close button */
  margin-bottom: 50px; /* Space below the form */
}

.field {
  margin-top: 20px;
  position: relative;
}

.field input {
  width: 100%;
  padding: 15px;
  font-size: 17px;
  border: 1px solid lightgrey;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.field input.highlight {
  border: 2px solid #3186d6;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
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

.field input:focus ~ label {
  top: 0;
  font-size: 16px;
  color: #3c97bf;
  background: white;
  padding: 0 5px;
  transform: translateY(-50%);
}

.add-comment-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 17px;
  display: block;
  width: 100%;
  max-width: 200px;
  margin: 10px auto; /* Center buttons and add spacing */
}

.add-comment-button {
  background: linear-gradient(-135deg, #01c2cc, #7d2ae7);
  color: white;
}

.cancel-button {
  background: #f44336;
  color: white;
}

.comments-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  background-color: #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  background-color: #acbecf;
  display: flex; /* Enable flexbox */
  flex-direction: column; /* Ensure items stack vertically */
  align-items: center; /* Center items horizontally */
}

.comments-list::-webkit-scrollbar {
  width: 8px;
}

.comments-list::-webkit-scrollbar-thumb {
  background-color: #3186d6; /* Customize scrollbar thumb color */
  border-radius: 4px;
}

.comment-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 450px;
  border: 1px solid #3186d6;
  position: relative;
}

.comment-card__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-card__header .material-symbols-outlined {
  color: #3186d6;
  font-size: 24px;
  margin-right: 8px;
}

.comment-card__author {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.comment-card__content {
  margin-bottom: 8px;
}

.comment-card__text {
  font-size: 14px;
  color: #555;
  transition: all 0.3s ease;
}

.comment-card__text.highlight-text {
  border: 1px solid #3186d6;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.comment-card__actions {
  display: flex;
  justify-content: flex-end;
}

.action-icon {
  cursor: pointer;
  margin-left: 10px;
  transition: opacity 0.3s ease;
}

.action-icon:hover {
  opacity: 0.7;
}
</style>

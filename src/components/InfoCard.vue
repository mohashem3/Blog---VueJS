<template>
  <div class="cards">
    <article class="information [ card ]">
      <span class="tag">Productivity</span>
      <h2 class="title">Never miss your important tasks</h2>
      <p class="info">
        <strong>NAFIS TO-DO</strong> tracks all the tasks for the day as you scheduled.
      </p>
      <p class="info">You will never have to worry about your daily tasks.</p>
      <button class="button" @click="showSignupPopup">Learn more</button>
    </article>
    <article class="plan [ card ]">
      <div class="inner">
        <span class="pricing">
          <span><strong>$0</strong> <small>/ m</small></span>
        </span>
        <h2 class="title">FREE</h2>
        <p class="info">Enjoy all our features for free.</p>
        <ul class="features">
          <!-- List items -->
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Add & Delete</strong> Tasks</span>
          </li>
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Edit</strong> Tasks</span>
          </li>
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Update</strong> Task Status</span>
          </li>
        </ul>
        <button class="button" @click="showSignupPopup">Choose Plan</button>
      </div>
    </article>
    <article class="information [ card ]">
      <span class="tag">Efficiency</span>
      <h2 class="title">The only tool you need to schedule your day</h2>
      <p class="info">
        Always keep updated with this simple tool on the go, when and wherever you need.
      </p>
      <dl class="details">
        <!-- Details -->
        <div>
          <dt>Satisfaction</dt>
          <dd>100%</dd>
        </div>
        <div>
          <dt>Customers</dt>
          <dd>35.5K</dd>
        </div>
      </dl>
    </article>
  </div>
</template>

<script setup>
const emit = defineEmits(['showSignUpPopup'])

const showSignupPopup = () => {
  emit('showSignUpPopup')
}
</script>

<!-- <template>
  <div class="cards">
    <article class="information [ card ]">
      <span class="tag">Productivity</span>
      <h2 class="title">Never miss your important tasks</h2>
      <p class="info">
        <strong>NAFIS TO-DO</strong> tracks all the tasks for the day as you scheduled.
      </p>
      <p class="info">You will never have to worry about your daily tasks.</p>
      <button class="button" @click="showSignupPopup">
        <span>Learn more</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="none"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z" fill="currentColor" />
        </svg>
      </button>
    </article>
    <article class="plan [ card ]">
      <div class="inner">
        <span class="pricing">
          <span><strong>$0</strong> <small>/ m</small></span>
        </span>
        <h2 class="title">FREE</h2>
        <p class="info">Enjoy all our features for free.</p>
        <ul class="features">
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Add & Delete</strong> Tasks</span>
          </li>
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Edit</strong> Tasks</span>
          </li>
          <li>
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span><strong>Update</strong> Task Status</span>
          </li>
        </ul>
        <button class="button" @click="showSignupPopup">Choose Plan</button>
      </div>
    </article>
    <article class="information [ card ]">
      <span class="tag">Efficiency</span>
      <h2 class="title">The only tool you need to schedule your day</h2>
      <p class="info">
        Always keep updated with this simple tool on the go, when and wherever you need.
      </p>
      <dl class="details">
        <div>
          <dt>Satisfaction</dt>
          <dd>100%</dd>
        </div>
        <div>
          <dt>Customers</dt>
          <dd>35.5K</dd>
        </div>
      </dl>
    </article>
  </div>
</template>

<script setup>
const emit = defineEmits(['showSignUpPopup'])

const showSignupPopup = () => {
  emit('showSignUpPopup')
}
</script> -->

<style>
@import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap');
*,
*:after,
*:before {
  box-sizing: border-box;
}

:root {
  --c-white: #fff;
  --c-black: #000;
  --c-ash: #eaeef6;
  --c-charcoal: #a0a0a0;
  --c-void: #141b22;
  --c-fair-pink: #ffedec;
  --c-apricot: #fbc8be;
  --c-coffee: #754d42;
  --c-del-rio: #917072;
  --c-java: #1fcac5;
  --c-titan-white: #f1eeff;
  --c-cold-purple: #a69fd6;
  --c-indigo: #6558d3;
  --c-governor: #4133b7;
}

body {
  font-family: 'Spline Sans', sans-serif;
  line-height: 1.5;
  min-height: 100vh;
  background-color: var(--c-ash);
}

.cards {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2.5rem;
  width: 90%;
  max-width: 1000px;
  margin: 10vh auto;
}

.card {
  border-radius: 16px;
  box-shadow: 0 30px 30px -25px #209cd3;
  max-width: 300px;
}

.information {
  background-color: var(--c-white);
  padding: 1.5rem;
  border-color: #209cd3;
}
.information .tag {
  display: inline-block;
  background-color: #dcffee;
  color: #01c2cc;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5em 0.75em;
  line-height: 1;
  border-radius: 6px;
}
.information .tag + * {
  margin-top: 1rem;
}
.information .title {
  font-size: 1.5rem;
  color: var(--c-void);
  line-height: 1.25;
}
.information .title + * {
  margin-top: 1rem;
}
.information .info {
  color: var(--c-charcoal);
}
.information .info + * {
  margin-top: 1.25rem;
}
.information .button {
  font: inherit;
  line-height: 1;
  background-color: var(--c-white);
  border: 2px solid #01c2cc;
  color: #01c2cc;
  padding: 0.5em 1em;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.information .button:hover,
.information .button:focus {
  background-color: #01c2cc;
  color: var(--c-white);
}
.information .details {
  display: flex;
  gap: 1rem;
}
.information .details div {
  padding: 0.75em 1em;
  background-color: #dae6ff;
  border-radius: 8px;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.125em;
  flex-basis: 50%;
}
.information .details dt {
  font-size: 0.875rem;
  color: #01c2cc;
}
.information .details dd {
  color: #01c2cc;
  font-weight: 600;
  font-size: 1.25rem;
}

.plan {
  padding: 10px;
  background-color: var(--c-white);
  color: var(--c-del-rio);
  border-color: #209cd3;
}
.plan strong {
  font-weight: 600;
  color: var(--c-coffee);
}
.plan .inner {
  padding: 20px;
  padding-top: 40px;
  background-color: #eaeef6;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.plan .pricing {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #01c2cc;
  border-radius: 99em 0 0 99em;
  display: flex;
  align-items: center;
  padding: 0.625em 0.75em;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--c-coffee);
}
.plan .pricing small {
  color: #01c2cc;
  font-size: 0.75em;
  margin-left: 0.25em;
}
.plan .title {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--c-coffee);
}
.plan .title + * {
  margin-top: 0.75rem;
}
.plan .info + * {
  margin-top: 1rem;
}
.plan .features {
  display: contents;
}
.plan .features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.plan .features li + * {
  margin-top: 0.75rem;
}
.plan .features .icon {
  background-color: var(--c-java);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-white);
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
.plan .features .icon svg {
  width: 14px;
  height: 14px;
}
.plan .features + * {
  margin-top: 1.25rem;
}
.plan button {
  font: inherit;
  background-color: #01c2cc;
  border-radius: 6px;
  color: var(--c-white);
  font-weight: 500;
  font-size: 1.125rem;
  width: 100%;
  border: 0;
  padding: 1em;
}
.plan button:hover,
.plan button:focus {
  background-color: #01c2cc;
}
</style>

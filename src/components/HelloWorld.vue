<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div class="hello-world">
    <h1 class="hello-world__title">{{ msg }}</h1>

    <div class="hello-world__card">
      <button 
        type="button" 
        class="hello-world__button"
        @click="count++"
      >
        count is {{ count }}
      </button>
      
      <p class="hello-world__text">
        Edit
        <code class="hello-world__code">components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <p class="hello-world__text">
      Check out
      <a 
        href="https://vuejs.org/guide/quick-start.html#local" 
        target="_blank"
        class="hello-world__link"
      >
        create-vue
      </a>, the official Vue + Vite starter
    </p>
    
    <p class="hello-world__text">
      Learn more about IDE Support for Vue in the
      <a
        href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
        target="_blank"
        class="hello-world__link"
      >
        Vue Docs Scaling up Guide
      </a>.
    </p>
    
    <p class="hello-world__docs-text">Click on the Vite and Vue logos to learn more</p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.hello-world {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-base;
  
  &__title {
    font-size: $font-size-extra-large;
    color: $color-text-primary;
    margin-bottom: $spacing-large;
    text-align: center;
  }
  
  &__card {
    padding: $spacing-base;
    border-radius: $border-radius-base;
    background-color: $color-bg-light;
    box-shadow: $shadow-light;
    margin-bottom: $spacing-large;
  }
  
  &__button {
    padding: $spacing-small $spacing-base;
    background-color: $color-primary;
    color: $color-bg-white;
    border: none;
    border-radius: $border-radius-base;
    cursor: pointer;
    font-size: $font-size-base;
    transition: background-color $transition-normal;
    
    &:hover {
      background-color: darken($color-primary, 10%);
    }
  }
  
  &__text {
    margin: $spacing-base 0;
    color: $color-text-regular;
  }
  
  &__code {
    background-color: #f9f9f9;
    padding: $spacing-extra-small $spacing-small;
    border-radius: $border-radius-small;
    font-family: monospace;
  }
  
  &__link {
    color: $color-primary;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__docs-text {
    color: #888;
    font-size: $font-size-small;
    margin-top: $spacing-large;
    text-align: center;
  }
  
  @include respond-to('md') {
    padding: $spacing-large;
    
    &__card {
      padding: $spacing-large;
    }
  }
}
</style>

<template>
  <div>
    <ul>
      <li :key="index" v-for="(l, index) in imagesList" @click="preview(index)">
        <img :src="l">
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    imagesList: {
      default: () => {
        return []
      }
    }
  },
  data () {
    return {

    }
  },
  methods: {
    preview (index) {
      this.$imagePreview({
        images: this.imagesList,
        index: index,
      })
    }
  }
}
</script>
<template>
  <div>
    <VEmojiPicker @select="selectEmoji" :showSearch="false" :showCategories="false" />
  </div>
</template>

<script>
import VEmojiPicker from 'v-emoji-picker';

export default {
  components: {
    VEmojiPicker
  },
  data () {
    return {

    }
  },
  methods: {
    selectEmoji (emoji) {
      this.$emit('emojiData', emoji.data)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
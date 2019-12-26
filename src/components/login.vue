<template>
  <div class="login-container">
    <el-button @click="handleLogin">登 陆</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  created () {
    this.sockets.subscribe('handleLogin', () => {
      console.warn(111111111111)
    });
  },
  methods: {
    handleLogin () {
      this.$socket.emit('userLogin')
    }

  }
}
</script>

<style lang="less" scoped>
.login-container {
  padding-top: 10%;
  text-align: center;
}
</style>
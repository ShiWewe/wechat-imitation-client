<template>
  <el-dialog class="dialog-setting" title="设置" :visible.sync="formData.visible" width="550px" append-to-body>
    <el-tabs tab-position="left">
      <el-tab-pane label="帐号设置" style="height:450px">
        <div class="setting-account">
          <el-avatar :size="100" shape="square" :src="userInfo && userInfo[0] && userInfo[0]['avatar']"></el-avatar>
          <div class="setting-user-id">
            <span>用户昵称：{{userInfo && userInfo[0] && userInfo[0]['username']}}</span>
          </div>
          <div class="setting-user-id">
            <span>id：{{userInfo && userInfo[0] && userInfo[0]['userId']}}</span>
          </div>
          <div class="setting-login-out">
            <span @click.stop="loginOut">退出登陆</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="通用设置" style="height:450px">通用设置</el-tab-pane>
      <el-tab-pane label="快捷按键" style="height:450px">快捷按键</el-tab-pane>
      <el-tab-pane label="关于微信" style="height:450px">
        <div class="logo">
          <a href="https://github.com/ShiWewe/wechat-imitation-client" target="_blank">
            <svg class="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </a>
          <div>Copyright © 2020 </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    formData: Object
  },
  data () {
    return {
      userInfo: null
    }
  },
  watch: {
    formData: {
      handler (val) {
        if (val.visible) {
          // console.dir(this.userInfo)
          this.userInfo = val.data.info
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions(['handleLoginOut']),
    // 退出登陆
    loginOut () {
      this.handleLoginOut().then(() => {
        this.$router.replace({ name: "login" })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-setting {
  /deep/.el-dialog {
    background: #f5f5f5;
  }
  /deep/.el-dialog__title {
    color: gray;
  }
  /deep/.el-dialog__body {
    padding: 10px;
  }
  /deep/.el-tabs__active-bar {
    background-color: #09bb07;
  }
  /deep/.el-tabs__item:hover,
  /deep/.el-tabs__item.is-active {
    color: #09bb07;
  }
  .setting-account {
    padding-top: 20px;
    text-align: center;
    .setting-user-id {
      padding-top: 20px;
      color: #333;
    }
    .setting-login-out {
      padding: 40px 0 20px 0;
      color: #333;
      span {
        padding: 3px 30px;
        border: 1px solid #e7e7e7;
        background: #fff;
        cursor: pointer;
      }
    }
  }
  .logo {
    padding-top: 40px;
    text-align: center;
    div {
      font-size: 12px;
      color: #aaa;
      padding: 15px;
    }
  }
}
</style>
<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">登陆窗口</div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
        <el-form-item prop="username">
          <el-input v-model.trim="ruleForm.username" placeholder="请输入昵称">
            <el-button slot="prepend" icon="el-icon-user-solid"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item prop="avatar" ref="avatarRef">
          <div class="form-avatar">
            <img v-for="(item, idx) in avatarList" :key="idx" :src="item.imgUrl" :class="{'actived': selectImg == idx}" @click.stop="handleClickImg(item, idx)">
          </div>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm()">登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Message } from 'element-ui';

export default {
  data: function () {
    const validateAvatar = (rule, value, callback) => {
      if (!this.ruleForm.avatar) {
        callback(new Error('请选择头像'));
      } else {
        callback();
      }
    }
    return {
      ruleForm: {
        username: '',
        avatar: ''
      },
      rules: {
        username: [{ required: true, message: '请输入昵称', trigger: ['blur', 'change'] }],
        avatar: [{ required: true, trigger: 'change', validator: validateAvatar }],
      },
      // 头像图片
      avatarList: [{
        imgUrl: require('@/assets/images/avatar1.png')
      },
      {
        imgUrl: require('@/assets/images/avatar2.png')
      },
      {
        imgUrl: require('@/assets/images/avatar3.png')
      },
      {
        imgUrl: require('@/assets/images/avatar4.png')
      },
      {
        imgUrl: require('@/assets/images/avatar5.png')
      },
      {
        imgUrl: require('@/assets/images/avatar6.png')
      },
      {
        imgUrl: require('@/assets/images/avatar7.png')
      },
      {
        imgUrl: require('@/assets/images/avatar8.png')
      }],
      selectImg: -1
    }
  },
  methods: {
    ...mapActions(['handleLogin']),
    handleClickImg (item, idx) {
      this.ruleForm.avatar = item.imgUrl
      this.selectImg = idx
      this.$refs.ruleForm.validateField('avatar')
    },
    submitForm (user) {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.handleLogin(this.ruleForm).then(() => {
            this.$router.replace({ path: "/wechat", query: { user: this.ruleForm.username } })
          })
        } else {
          console.error('error submit!!');
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.login-wrap {
  position: absolute;
  height: 100%;
  width: 100%;
  background-image: url("../assets/login-bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
}
.ms-login {
  position: absolute;
  left: 50%;
  top: 25%;
  transform: translateX(-50%);
  width: 350px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}
.form-avatar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.form-avatar img {
  margin: 5px;
  width: 20%;
  height: auto;
  vertical-align: bottom;
  border: 2px solid transparent;
  cursor: pointer;
}
.form-avatar img.actived {
  border: 2px solid tomato;
}
.ms-content {
  padding: 30px 30px;
}
.login-btn {
  text-align: center;
}
.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}
</style>
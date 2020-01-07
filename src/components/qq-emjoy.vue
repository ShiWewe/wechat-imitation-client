<template>
  <div class="qq-emjoy-box">
    <img v-for="(item, idx) in emjoyList" :key="idx" :src="item.facePath" :title="item.faceName" :alt="item.faceName" @click.stop="handleSelectImg(item)">
  </div>
</template>

<script>
export default {
  data () {
    return {
      emjoyList: [
        { faceName: "微笑", facePath: require('@/assets/images/face/0.gif') },
        { faceName: "撇嘴", facePath: require('@/assets/images/face/1.gif') },
        { faceName: "色", facePath: require('@/assets/images/face/2.gif') },
        { faceName: "发呆", facePath: require('@/assets/images/face/3.gif') },
        { faceName: "得意", facePath: require('@/assets/images/face/4.gif') },
        { faceName: "流泪", facePath: require('@/assets/images/face/5.gif') },
        { faceName: "害羞", facePath: require('@/assets/images/face/6.gif') },
        { faceName: "闭嘴", facePath: require('@/assets/images/face/7.gif') },
        { faceName: "大哭", facePath: require('@/assets/images/face/9.gif') },
        { faceName: "尴尬", facePath: require('@/assets/images/face/10.gif') },
        { faceName: "发怒", facePath: require('@/assets/images/face/11.gif') },
        { faceName: "调皮", facePath: require('@/assets/images/face/12.gif') },
        { faceName: "龇牙", facePath: require('@/assets/images/face/13.gif') },
        { faceName: "惊讶", facePath: require('@/assets/images/face/14.gif') },
        { faceName: "难过", facePath: require('@/assets/images/face/15.gif') },
        { faceName: "酷", facePath: require('@/assets/images/face/16.gif') },
        { faceName: "冷汗", facePath: require('@/assets/images/face/17.gif') },
        { faceName: "抓狂", facePath: require('@/assets/images/face/18.gif') },
        { faceName: "吐", facePath: require('@/assets/images/face/19.gif') },
        { faceName: "偷笑", facePath: require('@/assets/images/face/20.gif') },
        { faceName: "可爱", facePath: require('@/assets/images/face/21.gif') },
        { faceName: "白眼", facePath: require('@/assets/images/face/22.gif') },
        { faceName: "傲慢", facePath: require('@/assets/images/face/23.gif') },
        { faceName: "饥饿", facePath: require('@/assets/images/face/24.gif') },
        { faceName: "困", facePath: require('@/assets/images/face/25.gif') },
        { faceName: "惊恐", facePath: require('@/assets/images/face/26.gif') },
        { faceName: "流汗", facePath: require('@/assets/images/face/27.gif') },
        { faceName: "憨笑", facePath: require('@/assets/images/face/28.gif') },
        { faceName: "大兵", facePath: require('@/assets/images/face/29.gif') },
        { faceName: "奋斗", facePath: require('@/assets/images/face/30.gif') },
        { faceName: "咒骂", facePath: require('@/assets/images/face/31.gif') },
        { faceName: "疑问", facePath: require('@/assets/images/face/32.gif') },
        { faceName: "嘘", facePath: require('@/assets/images/face/33.gif') },
        { faceName: "晕", facePath: require('@/assets/images/face/34.gif') },
        { faceName: "折磨", facePath: require('@/assets/images/face/35.gif') },
        { faceName: "衰", facePath: require('@/assets/images/face/36.gif') },
        { faceName: "骷髅", facePath: require('@/assets/images/face/37.gif') },
        { faceName: "敲打", facePath: require('@/assets/images/face/38.gif') },
        { faceName: "再见", facePath: require('@/assets/images/face/39.gif') },
        { faceName: "擦汗", facePath: require('@/assets/images/face/40.gif') },
        { faceName: "抠鼻", facePath: require('@/assets/images/face/41.gif') },
        { faceName: "鼓掌", facePath: require('@/assets/images/face/42.gif') },
        { faceName: "糗大了", facePath: require('@/assets/images/face/43.gif') },
        { faceName: "坏笑", facePath: require('@/assets/images/face/44.gif') },
        { faceName: "左哼哼", facePath: require('@/assets/images/face/45.gif') },
        { faceName: "右哼哼", facePath: require('@/assets/images/face/46.gif') },
        { faceName: "哈欠", facePath: require('@/assets/images/face/47.gif') },
        { faceName: "鄙视", facePath: require('@/assets/images/face/48.gif') },
        { faceName: "委屈", facePath: require('@/assets/images/face/49.gif') },
        { faceName: "快哭了", facePath: require('@/assets/images/face/50.gif') },
        { faceName: "阴险", facePath: require('@/assets/images/face/51.gif') },
        { faceName: "亲亲", facePath: require('@/assets/images/face/52.gif') },
        { faceName: "吓", facePath: require('@/assets/images/face/53.gif') },
        { faceName: "可怜", facePath: require('@/assets/images/face/54.gif') },
        { faceName: "菜刀", facePath: require('@/assets/images/face/55.gif') },
        { faceName: "西瓜", facePath: require('@/assets/images/face/56.gif') },
        { faceName: "啤酒", facePath: require('@/assets/images/face/57.gif') },
        { faceName: "篮球", facePath: require('@/assets/images/face/58.gif') },
        { faceName: "乒乓", facePath: require('@/assets/images/face/59.gif') },
        { faceName: "拥抱", facePath: require('@/assets/images/face/78.gif') },
        { faceName: "握手", facePath: require('@/assets/images/face/81.gif') }
      ]
    }
  },
  methods: {
    handleSelectImg (e) {
      this.$emit('handleSelectImg', e)
    }
  }
}
</script>

<style lang="less" scoped>
.qq-emjoy-box {
  background-color: #fff;
  display: flex;
  flex-wrap: wrap;
  -moz-box-shadow: 0px 5px 5px #efefef;
  -webkit-box-shadow: 0px 5px 5px #efefef;
  box-shadow: 0px 5px 5px #efefef;
  img {
    border: 1px solid #ccc;
    margin-left: -1px;
    margin-top: -1px;
    position: relative;
    width: 24px;
    height: 24px;
    padding: 3px 3px 3px 3px;
    cursor: pointer;
    vertical-align: bottom;
  }
}
</style>
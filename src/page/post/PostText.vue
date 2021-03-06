<template>
  <div class="p-post-text m-box-model">

    <common-header :pinned="true">
      发布动态
      <template slot="left">
        <a href="javascript:;" @click="beforeGoBack">取消</a>
      </template>
      <template slot="right">
        <circle-loading v-if="loading" />
        <a
          v-else
          :class="{ disabled }"
          class="m-send-btn"
          @click.prevent.stop="beforePost">发布</a>
      </template>
    </common-header>

    <main>
      <div style="height: 100%;">
        <textarea-input
          v-model="contentText"
          :maxlength="255"
          :warnlength="200"
          :rows="11"
          class="textarea-input" />
      </div>

    </main>

    <footer>
      <v-switch
        v-if="paycontrol"
        v-model="pinned"
        type="checkbox"
        class="m-box m-bt1 m-bb1 m-lim-width m-pinned-row">
        <slot>是否收费</slot>
      </v-switch>
      <div
        v-show="pinned"
        style="margin-top: -1px"
        class="m-box-model m-lim-width m-main" >
        <div class="m-pinned-amount-btns">
          <p class="m-pinned-amount-label">设置文字收费金额</p>
          <div v-if="items.length > 0" class="m-box m-aln-center">
            <button
              v-for="item in items"
              :key="item"
              :style="{ width: `${1 / items.length * 100}%` }"
              :class="{ active: amount === item }"
              class="m-pinned-amount-btn"
              @click="chooseDefaultAmount(item)">{{ item }}</button>
          </div>
        </div>
        <div class="m-box m-aln-center m-justify-bet m-bb1 m-bt1 m-pinned-row plr20 m-pinned-amount-customize">
          <span>自定义金额</span>
          <div class="m-box m-aln-center">
            <input
              v-model="customAmount"
              type="number"
              pattern="[0-9]*"
              class="m-text-r"
              placeholder="输入金额"
              oninput="value=value.slice(0, 8)" >
            <span>{{ currency_name }}</span>
          </div>
        </div>
        <p class="m-pinned-amount-label plr20">注：超过{{ limit }}字部分内容收费</p>
      </div>
    </footer>
  </div>
</template>

<script>
import TextareaInput from "@/components/common/TextareaInput.vue";

export default {
  name: "PostText",
  components: {
    TextareaInput
  },
  data() {
    return {
      loading: false,
      contentText: "",
      curpos: 0,
      scrollHeight: 0,
      pinned: false,

      amount: 0,
      customAmount: null,

      appBackgroundColor: null
    };
  },
  computed: {
    currency_name() {
      return (
        (((this.$store.state.CONFIG || {}).site || {}).currency_name || {})
          .name || "积分"
      );
    },
    paycontrol() {
      return this.$store.state.CONFIG.feed.paycontrol;
    },
    disabled() {
      return !this.contentText.length;
    },
    items() {
      return this.$store.state.CONFIG.feed.items || [];
    },
    limit() {
      return this.$store.state.CONFIG.feed.limit || 50;
    }
  },
  watch: {
    customAmount(val) {
      if (val) this.amount = ~~val;
    }
  },
  mounted() {
    this.contentText = "";
  },
  methods: {
    beforeGoBack() {
      this.contentText.length === 0
        ? this.goBack()
        : this.$bus.$emit(
            "actionSheet",
            [
              {
                text: "确定",
                method: () => {
                  this.goBack();
                }
              }
            ],
            "取消",
            "你还有没有发布的内容,是否放弃发布?"
          );
    },
    chooseDefaultAmount(amount) {
      this.customAmount = null;
      this.amount = amount;
    },
    beforePost() {
      this.pinned
        ? this.amount === 0
          ? this.$Message.error("请设置收费金额")
          : this.contentText.length <= this.limit
            ? this.$Message.error(`正文内容不足${this.limit}字, 无法设置收费`)
            : this.postText()
        : ((this.amount = 0), this.postText());
    },
    postText() {
      if (this.loading) return;
      this.loading = true;
      this.$http
        .post(
          "feeds",
          {
            feed_content: this.contentText,
            feed_from: 2,
            feed_mark:
              new Date().valueOf() + "" + this.$store.state.CURRENTUSER.id,
            amount: this.amount
          },
          {
            validateStatus: s => s === 201
          }
        )
        .then(({ data }) => {
          this.$Message.success(data);
          this.loading = false;
          this.$router.push("/feeds?type=new");
        })
        .catch(() => {
          this.$Message.error("发送失败，请稍后重试");
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.p-post-text {
  background-color: #fff;
  height: 100%;

  main {
    flex: auto;
    padding-top: 90px;

    .textarea-input {
      padding-left: 20px;
    }
  }

  footer {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }
}
</style>

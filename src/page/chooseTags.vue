<template>
  <transition name="fade">
    <div v-if="show" class="m-box-model m-pos-f p-choose-tags m-main">

      <common-header :back="nextFuc">选择标签</common-header>

      <main class="m-box-model m-flex-grow1 m-flex-shrink1">
        <section class="m-flex-grow0 m-flex-shrink0 m-tags-group selected m-bb1">
          <span class="m-tags-label">可选择{{ 5 }}个标签，已选择{{ chooseTags.length }}标签</span>
          <transition-group tag="ul" class="m-tags">
            <li
              v-for="tag in chooseTags"
              v-if="tag.id"
              :key="`tags-selected-${tag.id}`"
              class="m-tag"
              @click="switchTagStatus(tag, -1)">
              <svg class="m-style-svg m-svg-def">
                <use xlink:href="#icon-clean"/>
              </svg>
              <span>{{ tag.name }}</span>
            </li>
          </transition-group>
        </section>
        <div class="m-flex-grow1 m-flex-shrink1" style="overflow-y: auto;">
          <section
            v-for="(group, Gindex) in tags"
            :key="group.id"
            class="m-tags-group">
            <span class="m-tags-label">{{ group.name }}</span>
            <transition-group tag="ul" class="m-tags">
              <li
                v-for="(tag, Tindex) in group.tags"
                v-if="tag.id"
                :key="tag.id"
                :class="{ selected: tag.selected }"
                class="m-tag"
                @click="switchTagStatus(tag, Gindex, Tindex)">
                <span>{{ tag.name }}</span>
              </li>
            </transition-group>
          </section>
        </div>
      </main>
    </div>
  </transition>
</template>

<script>
import { noop } from "@/util";

/**
 * 打开选择标签页面 (钩子 -> "choose-tags")
 * @author jsonleex <jsonlseex@163.com>
 * @param {Object} options
 * @param {Number[]} options.chooseTags 初始选择值, 只需传 [tag.id], eg: [1, 2, 3,...]
 * @param {Function} options.nextStep 点击下一步的回调, 注入已选择的 tags
 * @param {Function} options.onSelect 选择某个标签时执行的回调函数
 * @param {Function} options.onRemove 取消选择某个标签时执行的回调函数
 */
function onChooseTags({ chooseTags = [], nextStep, onSelect, onRemove }) {
  this.isFirst = !this.$lstore.hasData("H5_CHOOSE_TAGS_FIRST");
  this.nextStep = nextStep || noop;
  this.onSelect = onSelect || noop;
  this.onRemove = onRemove || noop;

  if (chooseTags && chooseTags.length > 0) {
    this.tags.forEach((g, Gindex) => {
      g.tags.forEach((t, Tindex) => {
        t.Gindex = Gindex;
        t.Tindex = Tindex;
        if (chooseTags.indexOf(t.id) > -1) {
          t.selected = true;
          this.chooseTags.push(t);
        }
      });
    });
  }

  this.show = true;
  this.scrollable = false;

  if (this.isFirst && this.$route.name !== "groupCreate") {
    this.$nextTick(() => {
      this.$bus.$emit("info-tips", {
        content:
          "标签为全局标签，选择合适的标签，系统可推荐你感兴趣的内容，方便找到相同身份或爱好的人，很重要哦！",
        onCancel: () => {
          this.$lstore.setData("H5_CHOOSE_TAGS_FIRST", false);
        }
      });
    });
  }
}

export default {
  name: "ChooseTags",
  data() {
    return {
      show: false,
      isFirst: false,
      chooseTags: [],
      loading: false,
      tags: []
    };
  },
  computed: {
    disabled() {
      return this.chooseTags.length === 0;
    }
  },
  created() {
    this.fetchTags();

    // 注册钩子
    this.$bus.$on("choose-tags", onChooseTags.bind(this));
  },
  methods: {
    nextFuc() {
      // if (this.disabled) return;
      this.nextStep(this.chooseTags);
      this.$nextTick(this.cancel);
    },
    nextStep: noop,
    onRemove: noop,
    onSelect: noop,
    fetchTags() {
      this.$http.get("/tags").then(({ data }) => {
        this.tags = data;
      });
    },
    switchTagStatus(tag, Gindex, Tindex) {
      const chooseTags = this.chooseTags;
      const isSelected = tag.selected;
      const status = {};
      const obj =
        Gindex > -1
          ? this.tags[Gindex]["tags"][Tindex]
          : this.tags[tag.Gindex]["tags"][tag.Tindex];

      if (isSelected) {
        chooseTags.splice(this.chooseTags.indexOf(tag), 1);
        status.selected = false;
        Object.assign(obj, status);
        this.onRemove(tag.id);
      } else {
        status.selected = true;
        status.Gindex = Gindex;
        status.Tindex = Tindex;
        if (chooseTags.length >= 5) {
          this.$Message.error("标签最多可选5个");
        } else {
          Object.assign(obj, status);
          chooseTags.push(obj);
          this.onSelect(tag.id);
        }
      }

      this.$set(this.tags, obj);
      this.chooseTags = chooseTags;
    },
    cancel() {
      this.chooseTags.forEach(tag => {
        delete tag.Gindex;
        delete tag.Tindex;
        delete tag.selected;
      });

      this.show = false;
      this.chooseTags = [];
      this.scrollable = true;
    }
  }
};
</script>
<style lang="less">
.p-choose-tags {
  main {
    overflow-y: auto;
    height: calc(~"100vh - 90px");
  }
  .m-tags-group {
    padding: 0 30px;
    margin-top: 30px;
    &:last-of-type {
      padding-bottom: 30px;
    }
  }
  .m-tags-label {
    font-size: 26px;
    color: @text-color3;
  }

  .m-tags {
    margin-left: -30px;
    margin-top: 0;
    min-height: 90px;

    .m-svg-def {
      position: absolute;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      fill: #b3b3b3;
      transform: translate(-50%, -50%);
    }
  }

  .m-tag {
    position: relative;
    margin: 30px 0 0 30px;
    width: calc((1 / 3 * 100%) ~" - 30px");
    height: 60px;
    line-height: 60px;
    border-radius: 3px;
    &.selected {
      background-color: rgba(89, 182, 215, 0.15);
      color: @primary;
    }
    span {
      overflow: hidden;
      width: 100%;
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: center;
    }
  }
}
</style>

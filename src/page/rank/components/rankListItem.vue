<template>
  <div :class="`${prefixCls}-list-item`">
    <span :class="{ top: index < 3 }" class="rank">{{ index + 1 }}</span>
    <div :class="`${prefixCls}-info`" @click="to(`/users/${user.id}`)">
      <avatar :class="`${prefixCls}-user-avatar`" :user="user"/>
      <div :class="`${prefixCls}-title`">
        <h6>{{ user.name }}</h6>
        <!-- 用于显示各排行榜数据的插槽 -->
        <slot/>
      </div>
    </div>

    <template v-if="!isMine(user)">
      <svg
        class="m-style-svg m-svg-big"
        @click.stop="followUser(user, isFollow(user))">
        <use :xlink:href="`#icon-${isFollow(user)}`"/>
      </svg>
    </template>
  </div>
</template>

<script>
import { followUserByStatus } from "@/api/user.js";

export default {
  name: "RankListItem",
  props: {
    prefixCls: { type: String, required: true },
    user: { type: Object, required: true },
    index: { type: Number, required: true }
  },
  methods: {
    isMine(user) {
      return this.$store.state.CURRENTUSER.id === user.id;
    },
    isFollow(user) {
      const { follower = false, following = false } = user;
      return follower && following
        ? "eachFollow"
        : follower
          ? "follow"
          : "unFollow";
    },
    followUser(user, status) {
      if (this.loading) return;
      this.loading = true;
      followUserByStatus({ status, id: user.id })
        .then(state => {
          user.follower = state;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
@prefixCls: rankItem;

.@{prefixCls}-list-item {
  display: flex;
  align-items: center;
  height: 135px;
  padding: 0 29px;
  background: #fff;
  border-bottom: 1px solid #ededed;
  justify-content: space-between;
  justify-content: center;
  .rank {
    &.top {
      color: @primary;
    }
    width: 15%;
    display: inline-flex;
    font-size: 34px;
    color: #999;
  }
}
</style>

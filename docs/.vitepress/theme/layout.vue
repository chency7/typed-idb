<template>
  <Layout>
    <template #doc-after>
      <div v-if="$route.path.startsWith('/api/')" class="api-container">
        <TSDNavigation />
        <Content />
      </div>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from "vitepress/theme";
import { useRoute } from "vitepress";

const { Layout } = DefaultTheme;
const route = useRoute();
</script>

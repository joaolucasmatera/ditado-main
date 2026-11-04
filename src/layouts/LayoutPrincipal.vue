<template>
  <v-app>
    <MenuLateral 
      :drawer="drawer" 
      @update:drawer="drawer = $event"
    />
    
    <BarraSuperior 
      @toggle-drawer="drawer = !drawer"
    />
    
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-4 pa-md-8">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import MenuLateral from '@/components/MenuLateral.vue'
import BarraSuperior from '@/components/BarraSuperior.vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const drawer = ref(!mobile.value)
</script>
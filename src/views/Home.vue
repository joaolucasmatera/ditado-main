<template>
  <div>
    <!-- Card de boas-vindas -->
    <v-card class="mb-4 mb-md-6" elevation="1">
      <v-card-text class="pa-6 pa-md-8">
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-2 mb-md-3">
          Bem-vindo ao Ditado
        </h1>
        <p class="text-body-2 text-md-body-1 text-grey-darken-1">
          Selecione uma opção no menu lateral para começar.
        </p>
      </v-card-text>
    </v-card>

    <!-- Card de últimas atualizações -->
    <v-card elevation="1">
      <v-card-title class="pa-4 pa-md-6 d-flex align-center">
        <v-icon class="mr-2 mr-md-3" color="grey-darken-2" size="24">mdi-update</v-icon>
        <span class="text-body-1 text-md-h6 font-weight-bold">Últimas atualizações</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-6 pa-md-10">
        <div class="text-center py-8 py-md-12">
          <v-icon size="48" size-md="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p class="text-body-2 text-md-body-1 text-grey mt-4">
            Nenhuma movimentação registrada ainda.
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
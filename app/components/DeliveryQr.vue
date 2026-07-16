<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { contact } from '#shared/utils/menu'

const value = `https://wa.me/${contact.whatsapp}`
</script>

<template>
  <div class="flex flex-col items-center gap-2 rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 ring-gold/15">
    <p class="font-display text-[0.6rem] tracking-widest text-gold/80">DOMICILIOS</p>
    <div class="rounded-xl bg-white p-2">
      <QrcodeVue :value="value" :size="104" level="M" render-as="svg" />
    </div>
    <p class="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold/70">Escanéame</p>
  </div>
</template>

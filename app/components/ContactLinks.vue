<script setup lang="ts">
import { contact } from '#shared/utils/menu'

const links = [
  {
    icon: 'ic:baseline-whatsapp',
    label: contact.whatsappDisplay,
    href: `https://wa.me/${contact.whatsapp}`,
  },
  {
    icon: 'mdi:instagram',
    label: `@${contact.instagram}`,
    href: `https://instagram.com/${contact.instagram}`,
  },
  {
    icon: 'mdi:facebook',
    label: `@${contact.facebook}`,
    href: `https://facebook.com/${contact.facebookURL}`,
  },
]
</script>

<template>
  <ul class="space-y-2">
    <li v-for="link in links" :key="link.icon">
      <a
        :href="link.href"
        target="_blank"
        rel="noopener"
        class="group flex items-center justify-end gap-2 text-2xl font-medium text-gold-soft/90 transition hover:text-gold"
      >
        {{ link.label }}
        <Icon :name="link.icon" class="size-5 text-ember-soft transition group-hover:scale-110" />
      </a>
    </li>
  </ul>
</template>

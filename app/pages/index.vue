<template>
  <div class="min-h-screen bg-ink pb-28">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 h-64"
      style="background: radial-gradient(ellipse at top, color-mix(in srgb, var(--color-ember) 25%, transparent), transparent 70%)"
    />

    <div class="relative mx-auto max-w-md px-5 pt-8">
      <header class="flex items-start justify-between gap-4">
        <BrandMark />
        <ContactLinks />
      </header>

      <div class="mt-8 flex items-center gap-4">
        <DeliveryQr />
        <div>

          <p class="flex-1 text-sm leading-snug text-gold-soft/80">
            Pide tus alas y cerdo al barril para recoger o a domicilio. Elige tus favoritos y
            confirma por WhatsApp.
          </p>
          <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-ember-soft">
            El pedido se activarà una vez confirmemos el pago por transferencia.
          </p>
        </div>
      </div>

      <main class="mt-10 space-y-10">
        <WingsSection />
        <PorkSection />
        <div id="entrega" class="scroll-mt-8">
          <DeliveryForm />
        </div>
      </main>
    </div>

    <OrderBar />
  </div>
</template>

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	future: {
		compatibilityVersion: 4
	},
	supabase: {
		redirect: false
	},

	modules: [
		'@pinia/nuxt',
		'@nuxt/ui',
		'@nuxtjs/supabase',
		'@vueuse/nuxt',
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxtjs/seo',
		'@formkit/auto-animate',
		'@nuxt/content'
	]
});

<template>
	<div class="size-full flex flex-col">
		<div
			class="w-full h-16 px-4 max-w-container mx-auto flex items-center gap-4"
		>
			<Logo />
			<div class="flex-1" />

			<AppearanceControls />
		</div>

		<hr />

		<div class="flex-1 p-4 flex items-center justify-center">
			<Island
				class="w-full max-w-120"
				content-class="flex flex-col gap-5 p-4 sm:gap-10 sm:p-10"
			>
				<NuxtPage />
			</Island>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue';
import type { XControl } from '~/composables/useXControl';

interface PasswordInputProps {
	control: XControl<string | number | null>;
	label?: string;
	autofocus?: boolean;
	min?: number;
	max?: number;
	required?: boolean;
}

const props = withDefaults(defineProps<PasswordInputProps>(), {
	label: 'Password',
	autofocus: false,
	min: undefined,
	max: undefined,
	required: false,
});

const isVisible = ref(false);
</script>

<template>
	<Input
		:control="props.control"
		:label="label"
		:type="isVisible ? 'text' : 'password'"
		:autofocus="autofocus"
		:min="min"
		:max="max"
		:required="required"
	>
		<template #trailing>
			<IconButton
				variant="ghost"
				color="default"
				size="sm"
				@click="isVisible = !isVisible"
			>
				<EyeOff v-if="isVisible" />
				<Eye v-else />
			</IconButton>
		</template>
	</Input>
</template>

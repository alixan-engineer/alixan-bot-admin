<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { XControl } from '~/composables/useXControl';

interface PhoneInputProps {
	control: XControl<string | number | null>;
	countryCode?: string;
	mask?: string;
	placeholder?: string;
	autofocus?: boolean;
}

const props = withDefaults(defineProps<PhoneInputProps>(), {
	countryCode: '+7',
	mask: '### ### ## ##',
	placeholder: '777 777 77 77',
	autofocus: false,
});

const isFocused = ref(false);
const displayControl = useXControl('');
const normalizedCountryCode = computed(() => props.countryCode.trim() || '+7');
const countryCodeDigits = computed(() =>
	normalizedCountryCode.value.replace(/\D/g, ''),
);
const maxDigits = computed(() => (props.mask.match(/#/g) ?? []).length);
const hasValue = computed(() => displayControl.value.length > 0);
const showPrefix = computed(() => isFocused.value || hasValue.value);
const visiblePlaceholder = computed(() =>
	showPrefix.value
		? undefined
		: `${normalizedCountryCode.value} ${props.placeholder}`,
);
const inputStyle = computed(() => {
	const offset = normalizedCountryCode.value.length + 2;

	return showPrefix.value ? { paddingLeft: `${offset}ch` } : undefined;
});

const applyMask = (value: string): string => {
	const digits = value.replace(/\D/g, '');
	let digitIndex = 0;

	return props.mask
		.split('')
		.map(symbol => {
			if (symbol !== '#') return symbol;
			const digit = digits[digitIndex];
			digitIndex += 1;
			return digit ?? '';
		})
		.join('')
		.replace(/[\s()-]+$/g, '');
};

const getNationalDigits = (value: string): string => {
	const digits = value.replace(/\D/g, '');
	const hasCountryCode =
		digits.length > maxDigits.value &&
		countryCodeDigits.value.length > 0 &&
		digits.startsWith(countryCodeDigits.value);
	const nationalDigits = hasCountryCode
		? digits.slice(countryCodeDigits.value.length)
		: digits;

	return nationalDigits.slice(0, maxDigits.value || undefined);
};

watch(
	() => props.control.value,
	value => {
		const formattedValue = applyMask(getNationalDigits(String(value ?? '')));
		if (formattedValue !== displayControl.value) {
			displayControl.setValue(formattedValue);
		}
	},
	{ immediate: true },
);

watch(
	() => displayControl.value,
	value => {
		const nationalDigits = getNationalDigits(value);
		if (nationalDigits !== String(props.control.value ?? '')) {
			props.control.setValue(nationalDigits, {
				markAsDirty: displayControl.dirty,
			});
		}
	},
);

watch(
	() => displayControl.touched,
	touched => {
		if (touched) props.control.markAsTouched();
	},
);

watch(
	() => props.control.disabled,
	disabled => {
		if (disabled) displayControl.disable();
		else displayControl.enable();
	},
	{ immediate: true },
);
</script>

<template>
	<Input
		:control="displayControl"
		type="tel"
		:mask="props.mask"
		:placeholder="visiblePlaceholder"
		:autofocus="props.autofocus"
		:style="inputStyle"
		autocomplete="off"
		@focus="isFocused = true"
		@blur="isFocused = false"
	>
		<template v-if="showPrefix" #leading>
			<span class="text-base font-medium text-foreground">
				{{ normalizedCountryCode }}
			</span>
		</template>
	</Input>
</template>

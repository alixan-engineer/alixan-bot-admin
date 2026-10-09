<script setup lang="ts">
import { X } from '@lucide/vue';
import {
	computed,
	nextTick,
	onBeforeUnmount,
	ref,
	useAttrs,
	useId,
	useSlots,
	watch,
	watchEffect,
} from 'vue';

import type { XControl } from '~/composables/useXControl';
import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
type InputAutocomplete = 'on' | 'off';
type InputValue = string | number | null;

interface InputProps {
	id?: string;
	label?: string;
	type?: InputType;
	placeholder?: string;
	autocomplete?: InputAutocomplete;
	hint?: string;
	error?: string;
	disabled?: boolean;
	readonly?: boolean;
	hasClearButton?: boolean;
	autofocus?: boolean;
	required?: boolean;
	min?: number;
	max?: number;
	pattern?: string;
	patternMessage?: string;
	mask?: string;
	control: XControl<InputValue>;
}

const props = withDefaults(defineProps<InputProps>(), {
	id: undefined,
	label: undefined,
	type: 'text',
	placeholder: undefined,
	autocomplete: undefined,
	hint: undefined,
	error: undefined,
	disabled: false,
	readonly: false,
	hasClearButton: true,
	autofocus: false,
	required: false,
	min: undefined,
	max: undefined,
	pattern: undefined,
	patternMessage: 'validation.pattern',
	mask: undefined,
});

const emit = defineEmits<{
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
	input: [event: Event];
}>();

const attrs = useAttrs();
const slots = useSlots();
const generatedId = useId();
const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const inputValue = computed<InputValue>({
	get: () => props.control.value,
	set: value => {
		props.control.setValue(value, { markAsDirty: true });
	},
});

const inputId = computed(() => props.id ?? generatedId);
const messageId = computed(() => `${inputId.value}-message`);
const hasLeading = computed(() => Boolean(slots.leading));
const hasTrailing = computed(() => Boolean(slots.trailing));
const stringValue = computed(() => String(inputValue.value ?? ''));
const hasValue = computed(() => stringValue.value.length > 0);

const matchesPattern = (value: string, pattern: string): boolean => {
	try {
		return new RegExp(`^(?:${pattern})$`).test(value);
	} catch {
		return true;
	}
};
type InputErrorKey = 'required' | 'min' | 'max' | 'pattern' | 'external';
type InputErrors = Partial<Record<InputErrorKey, string>>;

const errors = computed<InputErrors>(() => {
	const value = stringValue.value.trim();
	const result: InputErrors = {};

	if (props.required && !value) result.required = 'validation.required';
	if (value && props.min !== undefined && stringValue.value.length < props.min) {
		result.min = 'validation.minLength';
	}
	if (value && props.max !== undefined && stringValue.value.length > props.max) {
		result.max = 'validation.maxLength';
	}
	if (props.pattern && value && !matchesPattern(value, props.pattern)) {
		result.pattern = props.patternMessage;
	}
	if (props.error) result.external = props.error;
	return result;
});

const currentErrors = computed<InputErrors>(() =>
	props.control.errors,
);
const errorMessage = computed(
	() => Object.values(currentErrors.value).find(Boolean) ?? '',
);
const invalid = computed(() => Boolean(errorMessage.value));
const isTouched = computed(() => props.control.touched);
const isDisabled = computed(() => props.disabled || props.control.disabled);
const visibleError = computed(() =>
	isTouched.value && errorMessage.value ? errorMessage.value : '',
);
const messageText = computed(() => visibleError.value || props.hint || '');
const hasClearButton = computed(
	() =>
		props.hasClearButton &&
		!hasTrailing.value &&
		hasValue.value &&
		!isDisabled.value &&
		!props.readonly,
);
const hasTrailingAction = computed(
	() => hasTrailing.value || hasClearButton.value,
);
const isLabelMoved = computed(() => isFocused.value || hasValue.value);
const hasMessage = computed(() => Boolean(messageText.value));

const inputAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});

const inputBaseClass = 'h-14 rounded-2xl px-4 text-base';
const labelBaseClass = 'left-3';
const labelTopClass = 'top-4';
const leadingLabelClass = 'left-9';
const leadingPaddingClass = 'pl-10';
const trailingPaddingClass = 'pr-10';
const iconPositionClass = 'top-7 -translate-y-1/2';

const rootClass = computed(() =>
	cn('relative w-full min-h-20 space-y-1', attrs.class),
);

const inputClass = computed(() =>
	cn(
		'w-full border border-border placeholder:text-muted-foreground/70 hover:border-foreground/20 focus:outline-none focus:border-primary',
		inputBaseClass,
		props.type === 'password' ? 'text-sm tracking-wider' : '',
		props.label ? 'pt-2' : '',
		hasLeading.value ? leadingPaddingClass : '',
		hasTrailingAction.value ? trailingPaddingClass : '',
		visibleError.value
			? 'border-destructive text-destructive hover:border-destructive focus:border-destructive!'
			: '',
		isDisabled.value
			? 'cursor-not-allowed bg-secondary text-muted-foreground opacity-70'
			: '',
		props.readonly ? 'cursor-default' : '',
	),
);

const labelClass = computed(() =>
	cn(
		'pointer-events-none absolute z-10 px-1 text-base font-normal text-muted-foreground transition-all duration-200',
		labelTopClass,
		hasLeading.value ? leadingLabelClass : labelBaseClass,
		isLabelMoved.value ? '-translate-y-2 text-xs font-medium' : '',
		visibleError.value
			? 'text-destructive!'
			: isFocused.value
				? 'text-primary'
				: '',
		props.disabled ? 'text-muted-foreground/60' : '',
	),
);

const leadingSlotClass = computed(() =>
	cn('absolute left-3 z-10 text-muted-foreground', iconPositionClass),
);

const trailingSlotClass = computed(() =>
	cn('absolute right-3 z-10 text-muted-foreground', iconPositionClass),
);

const applyMask = (value: string): string => {
	if (!props.mask) {
		return value;
	}

	const rawDigits = value.replace(/\D/g, '');
	const digits =
		props.mask.startsWith('+7') && rawDigits.startsWith('7')
			? rawDigits.slice(1)
			: rawDigits;
	let digitIndex = 0;

	return props.mask
		.split('')
		.map(symbol => {
			if (symbol !== '#') {
				return symbol;
			}

			const digit = digits[digitIndex];
			digitIndex += 1;

			return digit ?? '';
		})
		.join('')
		.replace(/[\s()-]+$/g, '');
};

const handleFocus = (event: FocusEvent): void => {
	isFocused.value = true;
	emit('focus', event);
};

const handleBlur = (event: FocusEvent): void => {
	isFocused.value = false;
	props.control.markAsTouched();
	emit('blur', event);
};

const handleInput = (event: Event): void => {
	const target = event.target as HTMLInputElement;
	inputValue.value = props.mask ? applyMask(target.value) : target.value;

	emit('input', event);
};

const clearValue = async () => {
	if (isDisabled.value || props.readonly) return;
	inputValue.value = '';
	props.control.markAsTouched();
	await nextTick();
	inputRef.value?.focus();
};

const validate = (): boolean => {
	props.control.setErrors({ ...errors.value });
	return Object.keys(errors.value).length === 0;
};

watch(
	() => props.mask,
	() => {
		if (props.mask && hasValue.value) {
			inputValue.value = applyMask(stringValue.value);
		}
	},
);

watchEffect(() => {
	props.control.setErrors({ ...errors.value });
});

watch(
	() => props.control,
	(control, previousControl) => {
		previousControl?.setValidator();
		control.setValidator(validate);
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	props.control.setValidator();
});

</script>

<template>
	<div :class="rootClass">
		<label v-if="label" :for="inputId" :class="labelClass">
			{{ $t(label) }}
		</label>

		<span
			v-if="$slots.leading"
			:class="leadingSlotClass"
		>
			<slot name="leading" />
		</span>

		<input
			:id="inputId"
			ref="inputRef"
			v-bind="inputAttrs"
			:value="inputValue"
			:type="type"
			:placeholder="placeholder"
			:autocomplete="autocomplete"
			:autofocus="autofocus"
			:required="required"
			:pattern="pattern"
			:disabled="isDisabled"
			:readonly="readonly"
			:class="inputClass"
			@focus="handleFocus"
			@blur="handleBlur"
			@input="handleInput"
		/>

		<span v-if="$slots.trailing" :class="trailingSlotClass">
			<slot name="trailing" />
		</span>

		<IconButton
			v-else-if="hasClearButton"
			:class="trailingSlotClass"
			size="sm"
			@mousedown.prevent
			@click="clearValue"
		>
			<X />
		</IconButton>

		<Transition name="input-message" mode="out-in">
			<p
				v-if="hasMessage"
				:id="messageId"
				:key="messageText"
				:class="
					cn(
						'px-3 text-sm font-medium',
						visibleError ? 'text-destructive' : 'text-muted-foreground',
					)
				"
			>
				{{ $t(messageText, { min, max }) }}
			</p>
		</Transition>
	</div>
</template>

<style scoped lang="scss">
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
	box-shadow: 0 0 0 1000px var(--background) inset;
	caret-color: var(--foreground);
	-webkit-text-fill-color: var(--foreground);
	transition: background-color 999999s ease-in-out 0s;
}

.input-message-enter-active,
.input-message-leave-active {
	transition:
		opacity 160ms ease,
		transform 160ms ease,
		max-height 180ms ease;
}

.input-message-enter-from,
.input-message-leave-to {
	max-height: 0;
	opacity: 0;
	transform: translateY(-4px);
}

.input-message-enter-to,
.input-message-leave-from {
	max-height: 32px;
	opacity: 1;
	transform: translateY(0);
}
</style>

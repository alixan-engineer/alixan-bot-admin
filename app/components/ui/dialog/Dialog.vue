<script lang="ts">
let openDialogCount = 0;
let openDialogStack: symbol[] = [];
</script>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { cn } from '~/utils/cn';

defineOptions({
	inheritAttrs: false,
});

interface DialogProps {
	width?: string;
	height?: string;
	title?: string;
	closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), {
	width: '500px',
	height: 'auto',
	title: '',
	closeOnOverlay: true,
});

const emit = defineEmits<{
	close: [];
}>();

const open = defineModel<boolean>({ default: false });
const dialogToken = Symbol('dialog');

const dialogStyle = computed(() => {
	return {
		maxWidth: props.width,
		maxHeight: props.height,
	};
});

const closeDialog = (): void => {
	open.value = false;
	emit('close');
};

const handleOverlayMouseDown = (): void => {
	if (props.closeOnOverlay) {
		closeDialog();
	}
};

const handleKeydown = (event: KeyboardEvent): void => {
	const isTopDialog =
		openDialogStack[openDialogStack.length - 1] === dialogToken;

	if (event.key === 'Escape' && open.value && isTopDialog) {
		closeDialog();
	}
};

const lockBodyScroll = (): void => {
	openDialogStack = [...openDialogStack, dialogToken];
	openDialogCount = openDialogStack.length;
	document.body.style.overflow = 'hidden';
};

const unlockBodyScroll = (): void => {
	openDialogStack = openDialogStack.filter(token => token !== dialogToken);
	openDialogCount = openDialogStack.length;

	if (openDialogCount === 0) {
		document.body.style.overflow = '';
	}
};

watch(
	open,
	(value, oldValue) => {
		if (!import.meta.client) {
			return;
		}

		if (value && !oldValue) {
			document.addEventListener('keydown', handleKeydown);
			lockBodyScroll();
			return;
		}

		if (!value && oldValue) {
			document.removeEventListener('keydown', handleKeydown);
			unlockBodyScroll();
		}
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	if (!import.meta.client) {
		return;
	}

	document.removeEventListener('keydown', handleKeydown);

	if (open.value) {
		unlockBodyScroll();
	}
});
</script>

<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="open"
				class="backdrop z-9998 p-4 flex items-center justify-center"
				@mousedown.stop="handleOverlayMouseDown"
				@click.stop
			>
				<Transition
					appear
					enter-active-class="transition"
					enter-from-class="scale-95 opacity-0"
					enter-to-class="scale-100 opacity-100"
					leave-active-class="transition"
					leave-from-class="scale-100 opacity-100"
					leave-to-class="scale-95 opacity-0"
				>
					<div
						:style="dialogStyle"
						:class="
							cn(
								'size-full flex flex-col rounded-3xl border bg-background shadow-2xl',
								$attrs.class,
							)
						"
						@mousedown.stop
					>
						<DialogHeader
							v-if="title"
							:title="title"
							:close="closeDialog"
							class="border-b"
						/>
						<div class="flex-1 overflow-auto">
							<slot />
						</div>
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>

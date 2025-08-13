<script lang="ts">
	import { Alert, Button, Heading, Input, Li, List, Modal } from 'flowbite-svelte';
	let password = $state('');
	let isLoading = $state(false);
	let loginModalOpen = $state(false);
	let error: String | null = $state(null);

	import { goto, invalidateAll } from '$app/navigation';

	// Error types
	type LoginError = 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | 'NETWORK_ERROR';
	type LoginResult = { success: true } | { success: false; error: LoginError };

	const login = async (password: string): Promise<LoginResult> => {
		try {
			const response = await fetch('/api/v1/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				// Handle 401 specifically to give better error message
				if (response.status === 401) {
					return { success: false, error: 'INVALID_CREDENTIALS' };
				}
				return { success: false, error: 'SERVER_ERROR' };
			}

			// Force refresh of all load functions since auth state changed
			await invalidateAll();

			return { success: true };
		} catch (err) {
			return { success: false, error: 'NETWORK_ERROR' };
		}
	};

	const onLogin = async (e: Event) => {
		e.preventDefault();
		isLoading = true;
		error = null;

		const result = await login(password);

		if (result.success) {
			// Redirect to protected page after successful login
			goto('/');
		} else {
			error = result.error;
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Login - Open-WebMetering</title>
</svelte:head>
<div class="grid grid-cols-2">
	<div>
		<Heading tag="h1" class="mb-4">Track, Bill, and Optimize Your AI Costs</Heading>
		<List class="mb-4 list-disc dark:text-gray-300">
			<Li>Real-time cost tracking per user via Open-WebUI plugin.</Li>
			<Li>Dashboard for monitoring usage and costs.</Li>
			<Li>PDF report generation for billing users.</Li>
		</List>

		<Button onclick={() => (loginModalOpen = true)}>Login</Button>
	</div>
	<div>
		<img src="/icon.svg" class="m-y-auto me-3 h-full w-full object-contain" alt="Logo" />
	</div>
</div>
<Modal bind:open={loginModalOpen} class="p-4 backdrop:blur-sm">
	<Heading tag="h4" class="mb-4">Type in your password</Heading>
	<form class="pico" onsubmit={onLogin}>
		<fieldset class="flex flex-col gap-2">
			<Input
				bind:value={password}
				id="large-input"
				size="lg"
				placeholder="Password"
				type="password"
			/>
			{#if error != null}
				<Alert>
					<span class="font-medium">Wrong password</span>
					Please try again.
				</Alert>
			{/if}
			<Button onclick={onLogin}>Login</Button>
		</fieldset>
	</form>
</Modal>

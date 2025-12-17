<script lang="ts">
	import { goto } from '$app/navigation';
	import { AccordionItem, Alert, Button, Input, Label, Tooltip } from 'flowbite-svelte';

	const { user }: { user: { id: string; name: string; email: string; role: string } } = $props();
	let username = $state(user.name);
	let email = $state(user.email);
	let role = $state(user.role);

	let error: string | null = $state(null);
	const onResetUser = async (e: Event) => {
		if (e) {
			e.preventDefault();
		}
		try {
			const res = await fetch(`/api/v1/user/${user.id}`, {
				method: 'PUT'
			});
			if (!res.ok) {
				error = 'Soft delete failed!';
			}
			goto(window.location.href, { replaceState: true, noScroll: true });
		} catch {
			error = 'Soft delete failed!';
		}
	};
	const onDelete = async (e: Event) => {
		if (e) {
			e.preventDefault();
		}
		try {
			const res = await fetch(`/api/v1/user/${user.id}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				error = 'Delete failed!';
			}
			goto(window.location.href, { replaceState: true, noScroll: true });
		} catch {
			error = 'Delete failed!';
		}
	};
</script>

<AccordionItem>
	{#snippet header()}{user.name}{/snippet}
	{#if error !== null}
		<Alert color="red">
			<span class="font-medium">Error!</span>
			{error}
		</Alert>
	{/if}
	<form>
		<div class="mb-6 grid gap-6 md:grid-cols-2">
			<div class="col-span-2">
				<Label for="name" class="mb-2">Username</Label>
				<Input
					type="text"
					id="name"
					placeholder="Username"
					bind:value={username}
					required
					disabled
				/>
			</div>
			<div>
				<Label for="email" class="mb-2">Email</Label>
				<Input type="text" id="email" placeholder="Email" bind:value={email} required disabled />
			</div>
			<div>
				<Label for="role" class="mb-2">Role</Label>
				<Input type="text" id="role" placeholder="Role" bind:value={role} required disabled />
			</div>
			<div class="col-span-2 flex flex-row gap-2">
				<Button onclick={onResetUser}>Delete User Only</Button>
				<Tooltip>Deletes only the user record, activities stay in database</Tooltip>
				<Button onclick={onDelete}>Delete User and Activities</Button>
				<Tooltip>Deletes user and their activities</Tooltip>
			</div>
		</div>
	</form>
</AccordionItem>

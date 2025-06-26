<script lang="ts">
	import { AccordionItem, Button, Checkbox, Input, Label, P } from 'flowbite-svelte';

	const { user }: { user: { name: string; email: string; role: string } } = $props();
	let username = $state(user.name);
	let email = $state(user.email);
	let role = $state(user.role);

	let edit = $state(false);
	const onUpdateUser = async (e: Event) => {
		if (e) {
			e.preventDefault();
		}
	};
	const onResetUser = async (e: Event) => {
		if (e) {
			e.preventDefault();
		}
	};
	const onDelete = async (e: Event) => {
		if (e) {
			e.preventDefault();
		}
	};
</script>

<AccordionItem>
	{#snippet header()}{user.name}{/snippet}
	<P size="sm"
		>It's often better to reset users instead of editing them manually. The user data will then be
		refreshed during their next activity.</P
	>
	<form>
		<div class="mb-6 grid gap-6 md:grid-cols-2">
			<div class="col-span-2">
				<Label for="first_name" class="mb-2">Username</Label>
				<Input
					type="text"
					id="first_name"
					placeholder="Username"
					bind:value={username}
					required
					disabled={!edit}
				/>
			</div>
			<div>
				<Label for="last_name" class="mb-2">Email</Label>
				<Input
					type="text"
					id="last_name"
					placeholder="Email"
					bind:value={email}
					required
					disabled={!edit}
				/>
			</div>
			<div>
				<Label for="company" class="mb-2">Role</Label>
				<Input
					type="text"
					id="company"
					placeholder="Flowbite"
					bind:value={role}
					required
					disabled={!edit}
				/>
			</div>
			<div class="col-span-2 flex flex-row gap-2">
				<Checkbox bind:checked={edit}>Enable editing</Checkbox>
				<Button onclick={edit ? onUpdateUser : onResetUser}>{edit ? 'Save' : 'Reset'}</Button>
				<Button onclick={onDelete}>Delete</Button>
			</div>
		</div>
	</form>
</AccordionItem>

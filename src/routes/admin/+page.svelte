<script lang="ts">
	import { Accordion, Alert, Heading, Spinner } from 'flowbite-svelte';
	import UserSetting from '$lib/components/UserSetting.svelte';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
</script>

<div class="flex w-full flex-col gap-2">
	<Heading class="mb-2">Administration</Heading>
	{#await data.users}
		<div class="my-4 w-full text-center">
			<Spinner class="inline-block" />
		</div>
	{:then users}
		{#each users as user}
			<Accordion>
				<UserSetting {user} />
			</Accordion>
		{/each}
	{:catch}
		<Alert color="red">
			<span class="font-medium">Error!</span>
			Could not load users from backend!
		</Alert>
	{/await}
</div>

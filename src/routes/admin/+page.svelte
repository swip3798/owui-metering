<script lang="ts">
	import { Accordion, Heading, P } from 'flowbite-svelte';
	import UserSetting from '$lib/components/UserSetting.svelte';
</script>

<div class="flex w-full flex-col gap-2">
	<Heading class="mb-2">Administration</Heading>
	<Accordion>
		<UserSetting user={{ name: 'TestUser', role: 'Admin', email: 'test@web.de' }} />
		<UserSetting user={{ name: 'TestUser', role: 'Admin', email: 'test@web.de' }} />
		<UserSetting user={{ name: 'TestUser', role: 'Admin', email: 'test@web.de' }} />
	</Accordion>
</div>
